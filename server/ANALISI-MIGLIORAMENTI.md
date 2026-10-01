# Analisi e miglioramenti del server

Analisi statica del backend Node.js/Express in `server/`. I rilievi sono ordinati per impatto; non sono state apportate modifiche al codice né eseguiti test runtime.

## Criticità prioritarie

1. **Possibile aggiramento dei permessi durante l’aggiornamento di una Thing.** In [`src/bl/thingsMngr.js`](src/bl/thingsMngr.js#L775) i campi vengono prima controllati singolarmente, ma successivamente `thing.set(thingDTO)` copia sul documento tutto il DTO ricevuto. Campi non autorizzati, inclusi valore, claim e diritti degli utenti, possono così essere modificati. Rimuovere l’assegnazione massiva e persistere solo i campi verificati.

2. **Scritture MongoDB non attese.** Il salvataggio dei log e delle Thing non usa `await`: una risposta o una notifica realtime può essere inviata prima della conferma di persistenza, e gli errori di scrittura possono sfuggire alla gestione della richiesta. Attendere i salvataggi prima di rispondere o notificare. Riferimenti: [`src/controllers/logController.js`](src/controllers/logController.js#L32), [`src/bl/thingsMngr.js`](src/bl/thingsMngr.js#L576), [`src/bl/thingsMngr.js`](src/bl/thingsMngr.js#L776), [`src/bl/thingsMngr.js`](src/bl/thingsMngr.js#L809).

3. **Rimozione della registrazione pendente incompatibile con Mongoose recente.** Il lockfile specifica Mongoose 9; `Document#remove()` è stato rimosso da Mongoose 7. La conferma crea prima l’utente e poi tenta di eliminare la registrazione pendente: il secondo passaggio può fallire lasciando un account creato e restituendo errore. Usare `deleteOne()` e gestire in modo coerente i due passaggi. Riferimenti: [`src/models/UserPending.js`](src/models/UserPending.js#L33), [`src/controllers/accountController.js`](src/controllers/accountController.js#L199), [`package-lock.json`](package-lock.json#L25).

4. **Verifica TLS SMTP disabilitata.** `rejectUnauthorized: false` accetta certificati non validi, esponendo la connessione e le credenziali SMTP a un possibile attacco man-in-the-middle. Rimuovere l’opzione o impostarla a `true`. Riferimento: [`src/controllers/accountController.js`](src/controllers/accountController.js#L33).

5. **Endpoint `/api` non autenticato con lettura non limitata.** La rotta carica tutti gli utenti a ogni chiamata e avvia una notifica globale. Può diventare costosa al crescere della base utenti e può essere usata per generare carico. Se è un health check, dovrebbe restituire solo lo stato del servizio; altrimenti limitarne accesso e lavoro.

## Prestazioni e scalabilità

- **Query N+1 nella creazione delle DTO.** Per ogni Thing e per ogni diritto utente, `getUsersInfosAsync` effettua una ricerca MongoDB, in sequenza. Anche `getUsersIdsToNotify` risolve gli utenti uno alla volta. Caricare gli utenti in batch o usare una strategia di popolamento ridurrebbe le query. Riferimento: [`src/bl/thingsMngr.js`](src/bl/thingsMngr.js#L352).
- **Bcrypt sincrono.** `compareSync` blocca l’event loop durante login e autenticazione. Usare la variante asincrona e limitare i tentativi di autenticazione. Riferimento: [`src/models/User.js`](src/models/User.js#L45).
- **Indici applicativi non visibili negli schemi.** Username, email, API key e campi usati nei filtri sulle Thing sono interrogati frequentemente, ma non risultano indici espliciti. Valutare indici mirati e vincoli univoci per username/API key, dopo aver verificato e ripulito eventuali duplicati esistenti.
- **Conteggio e recupero separati.** Il listing esegue un conteggio e poi una query paginata; valutare se il conteggio totale è sempre necessario e monitorare le query con `explain()` prima di aggiungere indici o cambiare strategia.

## Sicurezza e validazione

- **CORS permissivo.** Express e Socket.IO accettano origini non limitate. Configurare una allowlist coerente con i client previsti. Riferimenti: [`src/server.js`](src/server.js#L58), [`src/realtimeNotifier.js`](src/realtimeNotifier.js).
- **Filtri MongoDB controllati dal client.** `thingFilter`, `valueFilter` e `orderBy` vengono decodificati da JSON e passati alle query senza una allowlist di campi/operatori. Limitare forma, operatori e dimensione dei filtri; trattare JSON malformato come `400 Bad Request`, non come errore interno. Riferimenti: [`src/controllers/thingsController.js`](src/controllers/thingsController.js#L52), [`src/bl/thingsMngr.js`](src/bl/thingsMngr.js#L248).
- **Registrazione enumerabile e priva di rate limit.** La rotta di registrazione usa GET per un’azione con effetti collaterali e risponde in modo diverso quando l’email esiste già. Applicare rate limiting, usare POST e uniformare le risposte per ridurre enumerazione e abuso dell’invio email. Riferimento: [`src/controllers/accountController.js`](src/controllers/accountController.js#L94).
- **Credenziali realtime nella query string.** Il token Socket.IO è letto da `handshake.query.token`; gli URL possono finire in log o altri sistemi di osservabilità. Preferire `handshake.auth`, limitare le origini e prevedere rotazione/revoca delle API key. Riferimento: [`src/realtimeNotifier.js`](src/realtimeNotifier.js).
- **Messaggi interni esposti nelle risposte 500.** Il middleware di errore restituisce messaggi d’errore non filtrati. Registrare i dettagli lato server e inviare al client un messaggio generico con un identificativo di correlazione. Riferimento: [`src/server.js`](src/server.js#L193).

## Affidabilità e correttezza

- **Avvio prima della connessione MongoDB.** `mongoose.connect()` non viene atteso prima di `listen()`: il server può accettare richieste mentre il database non è pronto. Attendere la connessione prima di aprire la porta e implementare shutdown ordinato per HTTP, Socket.IO e MongoDB.
- **Caricamento configurazione dopo gli import.** `dotenv.config()` viene chiamato nel corpo di `server.js`, mentre i moduli importati sono valutati prima; il logger legge `NODE_ENV` durante l’inizializzazione. Caricare l’ambiente prima dei moduli che lo consumano e risolvere certificati, template e log rispetto alla directory del modulo, non alla working directory.
- **Data di cancellazione assegnata in modo errato alla creazione.** In un ramo viene assegnato `Date.now` invece del risultato `Date.now()`. Riferimento: [`src/bl/thingsMngr.js`](src/bl/thingsMngr.js#L556).
- **Header e controllo paginazione da correggere.** Il `Content-Range` usa `top` come estremo iniziale e `skip` come finale; il controllo `!blResult.top == null` non verifica la condizione attesa. Calcolare gli estremi a partire da `skip` e dal numero di risultati effettivi e validare esplicitamente i campi. Riferimento: [`src/controllers/thingsController.js`](src/controllers/thingsController.js#L61).
- **Test automatici assenti.** Lo script `test` del server termina con “no test specified”. Aggiungere almeno test per autorizzazioni sulle Thing, conferma account e persistenza delle scritture prima di interventi più ampi.

## Roadmap prioritizzata

| Step | Priorità | Attività | Criterio di completamento |
|---|---|---|---|
| 1 | P0 - Integrità | Aggiungere test di regressione per ACL Thing, inclusa lettura anonima e modifica di campi non autorizzati. | Test riproducono i casi problematici e definiscono il comportamento atteso. |
| 2 | P0 - Integrità | Correggere l'aggiornamento Thing: applicare solo i campi autorizzati, non l'intero DTO. | Un utente non può modificare claim o proprietà fuori dai propri permessi. |
| 3 | P0 - Integrità | Correggere `getThing` per gestire `user` nullo durante la lettura pubblica. | Una Thing pubblica è leggibile anonimamente; risorse private restano protette. |
| 4 | P0 - Persistenza | Attendere i salvataggi Mongo prima di rispondere o notificare; chiudere ogni percorso HTTP con una risposta. | Errori DB vengono propagati e nessuna richiesta rimane appesa. |
| 5 | P0 - Persistenza | Sostituire `Document#remove()` nella conferma account e rendere coerente il flusso di creazione/eliminazione pendente. | Conferma compatibile con Mongoose 9 e retry con esito prevedibile. |
| 6 | P1 - Sicurezza | Ripristinare la verifica certificato TLS SMTP; aggiungere rate limit e risposta uniforme alla registrazione. | TLS verificato e tentativi di login/registrazione limitati. |
| 7 | P1 - Sicurezza | Limitare CORS, validare filtri/operatori Mongo e spostare il token Socket.IO fuori dalla query string. | Origini e input sono allowlistati; credenziali non vengono passate nell'URL. |
| 8 | P1 - Sicurezza | Escludere password, API key e token di conferma dalle query ordinarie; pianificare hash/rotazione delle API key. | I segreti sono restituiti solo nei percorsi che ne hanno necessità. |
| 9 | P1 - Integrità account | Aggiungere vincoli univoci per username/email e gestire richieste di conferma concorrenti; transazione se disponibile. | Le registrazioni duplicate non creano account inconsistenti. |
| 10 | P1 - Affidabilità | Attendere Mongo prima di aprire la porta; aggiungere shutdown ordinato e non esporre dettagli interni negli errori. | Avvio, arresto ed errori sono deterministici e sicuri. |
| 11 | P2 - Architettura | Estrarre policy ACL pure e testabili, riusate dai casi d'uso Thing. | Regole ACL non dipendono da Express/Mongoose e hanno test unitari. |
| 12 | P2 - Architettura | Estrarre `UpdateThing` e il repository Thing; mantenere Mongoose nell'adapter. | Il caso d'uso è testabile senza database e gli endpoint restano invariati. |
| 13 | P2 - Architettura | Iniettare un publisher realtime e notificare dopo il salvataggio riuscito. | Il caso d'uso non dipende da Socket.IO e non notifica scritture fallite. |
| 14 | P2 - Architettura | Separare factory Express dal bootstrap e comporre le dipendenze in un punto unico. | Test HTTP avviabili senza aprire porte o connettersi a servizi reali. |
| 15 | P2 - Qualità | Aggiungere request ID e log strutturati; registrare gli errori una sola volta. | Log correlabili senza duplicazioni né segreti. |
| 16 | P2 - Architettura | Estendere il modello modulare a `account` e `log` solo dove riduce accoppiamento. | Moduli con dipendenze esplicite, senza riscrittura generalizzata. |
| 17 | P3 - Prestazioni | Misurare con `explain()` e rimuovere query N+1 con caricamenti batch; aggiungere indici motivati dai piani. | Meno query per richiesta e piani verificati su dati rappresentativi. |
| 18 | P3 - Prestazioni | Usare bcrypt asincrono; valutare `lean()` e proiezioni nelle letture. | Event loop non bloccato e miglioramenti confermati da misurazioni. |
| 19 | P3 - Correttezza | Correggere `Content-Range`, validazione paginazione e assegnazione `Date.now`; rendere i percorsi indipendenti dalla working directory. | Casi limite coperti da test e avvio ripetibile da directory diverse. |
| 20 | P3 - Scalabilità condizionale | Se gli offset profondi sono lenti, valutare cursor pagination; se si usano più istanze, adottare room Socket.IO e adapter condiviso. | Cambiamenti introdotti solo dopo aver dimostrato la necessità con misure/deployment. |

**Ordine di avvio:** completare gli step 1-5 prima dell'esposizione pubblica; chiudere gli step 6-10 per la baseline di sicurezza e affidabilità; poi procedere con architettura e ottimizzazioni. Un outbox è necessario solo se si deve garantire la consegna degli eventi anche in caso di arresto tra persistenza e notifica.

## Analisi architetturale

### Struttura attuale

Il backend è un monolite Node.js/Express organizzato principalmente per livelli tecnici:

```text
Client HTTP -> Express/Passport -> Controller -> BL managers -> Mongoose -> MongoDB
					   |                 |
					   +-> RealtimeNotifier -> Socket.IO

			      common -> DTO e costanti condivisi
```

Il bootstrap in [`src/server.js`](src/server.js) configura l'applicazione e avvia database, autenticazione, HTTPS e realtime. Le rotte sono nei controller, la logica applicativa nei manager `bl`, gli schemi e le query Mongoose nei modelli.

### Pattern architetturali individuati

- **Layered architecture:** controller, business logic e modelli costituiscono livelli riconoscibili, ma i confini tra essi non sono sempre rispettati.
- **Repository-like / Active Record:** i moduli dei modelli espongono funzioni di query, ma i manager manipolano direttamente documenti Mongoose e ne invocano la persistenza. Non esiste un'astrazione repository indipendente dall'ORM.
- **DTO e mapping:** DTO e costanti in `common` definiscono contratti condivisi; la conversione tra documento e DTO è invece distribuita tra utility e manager.
- **Strategy e middleware:** Passport delega l'autenticazione alle proprie strategie; Express organizza middleware, controller e gestione degli errori.
- **Observer / publish-subscribe:** `RealtimeNotifier` propaga eventi applicativi ai client Socket.IO. L'interfaccia dei connector suggerisce trasporti intercambiabili, ma l'implementazione concreta è esposta attraverso metodi statici.
- **ACL con claim a bitmask:** i permessi sono codificati come bitmask e applicati soprattutto in `thingsMngr.js`; non costituiscono ancora un componente di dominio autonomo.

### Problemi di separazione delle responsabilità

- `thingsMngr.js` concentra policy di accesso, query, mutazioni Mongoose, mapping DTO e selezione dei destinatari realtime. È il principale punto di accoppiamento e il candidato migliore per una prima estrazione.
- I manager dipendono direttamente da Mongoose e da altri manager: testare i casi d'uso richiede quindi più infrastruttura di quanto dovrebbe.
- I controller conoscono sia la logica dei casi d'uso sia il notifier realtime. L'ordine tra persistenza e pubblicazione dell'evento non è rappresentato da un confine esplicito.
- Le regole ACL sono distribuite tra funzioni diverse; la stessa decisione di accesso può divergere tra lettura, modifica e costruzione della risposta.
- `server.js` mescola composizione applicativa, configurazione e ciclo di vita dei servizi, rendendo meno agevole creare l'app nei test senza aprire porte o connettersi a MongoDB.

### Architettura interna consigliata

Conservare il deployment come monolite, ma organizzare il codice in moduli funzionali (`things`, `account`, `log`) con dipendenze dirette e verificabili:

```text
HTTP route/controller
	|
	v
Application use case -> Domain policy / entities
	|                         |
	+-> Repository port <-----+
	|          |
	|          v
	|     Mongoose adapter
	|
	+-> Event publisher port -> Socket.IO adapter
```

- **Controller:** traduce HTTP in input del caso d'uso e il risultato in status code/DTO; non contiene decisioni di dominio.
- **Application service/use case:** orchestra operazioni specifiche, ad esempio `UpdateThing` o `ListThings`, senza dipendere da Express.
- **Policy di dominio:** funzioni pure per autorizzazione e claim, riutilizzate dai casi d'uso e testabili senza database.
- **Repository:** interfaccia orientata al dominio per caricare e salvare Thing e utenti; l'adapter Mongoose mantiene i dettagli dell'ORM.
- **Mapper:** conversione esplicita tra documenti e DTO, senza incorporare query o controlli di accesso.
- **Event publisher:** interfaccia applicativa per notifiche; l'adapter Socket.IO invia gli eventi dopo la persistenza riuscita.
- **Bootstrap e configurazione:** un modulo compone le dipendenze e avvia i servizi; la creazione dell'app Express deve poter essere testata separatamente dall'avvio del server.

Non serve una classe per ogni funzione: introdurre interfacce solo dove riducono accoppiamento o abilitano test mirati. Mantenere REST, DTO e contratti esistenti durante la riorganizzazione.

### Livello atteso e impatto

Il risultato atteso è un monolite modulare moderno, con DDD pragmatico e dipendenze esagonali: più testabile e manutenibile, ma non automaticamente "allo stato dell'arte" senza test, controlli continui e pratiche operative adeguate.

- **Codice:** impatto medio-alto, soprattutto su `thingsMngr.js`; aumentano i moduli e l'indirezione, ma diminuisce l'accoppiamento.
- **Contratti:** API, DTO ed eventi Socket.IO possono restare invariati mantenendo gli adapter attuali.
- **Runtime e infrastruttura:** overhead trascurabile; MongoDB e il deployment monolitico possono restare. La riorganizzazione non garantisce da sola prestazioni migliori.
- **Rischio principale:** regressioni nelle regole ACL e nei flussi di registrazione/notifica; ridurlo con test di caratterizzazione e migrazione per casi d'uso.
- **Costo:** lavoro da pianificare in fasi, nell'ordine di settimane più che di una riscrittura breve; la durata dipende dalla copertura dei test e dai comportamenti legacy da preservare.
