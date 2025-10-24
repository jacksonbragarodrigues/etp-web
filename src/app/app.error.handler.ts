import { Injectable, ErrorHandler } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AppErrorHandler extends ErrorHandler {

    constructor() {
        super();
    }

    override handleError(error: any) {
        super.handleError(error);
    }
}
