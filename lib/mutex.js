/**
 * @module mutex
 * @description 
 */

import { logDebug } from "../logger/logger.js";

class Mutex {
    constructor(){
        this._queue = [];
        this._locked = false;
    }

    lock(){
        return new Promise(resolve => {
            const tryAquire = () => {
                if(!this._locked){
                    this._locked = true;
                    logDebug(`[MUTEX] Lock aquired`);

                    resolve(this.unlock.bind(this));
                } else {
                    logDebug(`[MUTEX] Lock busy, request queued`);
                    this._queue.push(tryAquire);
                }
            };

            tryAquire();
        });   
    }

    unlock(){
        this._locked = false;
        if(this._queue.length > 0){
            logDebug("[MUTEX] Passing the lock to the next function");

            const next = this._queue.shift();
            next();
        } else {
            logDebug("[MUTEX] Lock released");
        }
    }
}

export default Mutex;