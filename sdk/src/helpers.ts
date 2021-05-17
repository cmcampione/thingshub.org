import axios, { CancelToken } from "axios";

export interface ItemsRange {
    skip:number;
    top: number;
    totalItems: number
}

// INFO: It is a wrapper for "axios" to abort Http calls
export class HttpRequestCanceler {

    public cancelerToken: CancelToken = null;
    private executor : any = null;

    public constructor() {
        this.reset();
    }
    public cancel() : void {

        if (this.executor)
            this.executor();
    }
    public reset() {
        this.executor = null;
        this.cancelerToken = new axios.CancelToken((c) : void => {
            this.executor = c
        });
    }
}

// INFO: It is a wrapper for "axios" http call result
export type HttpFailResult = any;

export class Helpers {

    public static getRangeItemsFromResponse(response: any) : ItemsRange  {
        
        //ToDo: It's very common find "response.headers" syntax so for now is good
        var contentRange = response.headers["content-range"];

        var top: number = 0;
        var skip: number = 0;
        var totalItems: number = 0;
        if (contentRange) {
            var arr1 = contentRange.split("/");
            if (arr1.length != 0) {
                var arr2 = arr1[0].split(" ");
                if (arr2.length == 2) {
                    var arr3 = arr2[1].split("-");
                    if (arr3.length == 2) {
                        top = parseInt(arr3[0]);
                        skip = parseInt(arr3[1]);
                    }
                }

                if (arr1.length == 2)
                    totalItems = parseInt(arr1[1]);
            }
        }
        return {
            top: top,
            skip: skip,
            totalItems: totalItems
        }
    }
}