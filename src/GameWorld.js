"use strict";

const Serializable = require("./Composables/Serializable");

class GameWorld{

    constructor(){
        this.stepCount = 0;
        this.objects = {};
        this.playerCount = 0;
    }

    release() {
        for (var objId in this.objects) {
            let o = this.objects[objId];
            if (typeof o.release === 'function') {
                o.release();
            }
        }
    }

    static deserialize(gameEngine, worldData){

        var world = new GameWorld();

        var worldDataDV = new DataView(worldData);
        world.stepCount = worldDataDV.getInt32(0);
        var byteOffset = Int32Array.BYTES_PER_ELEMENT;

        world.lastHandledInput = worldDataDV.getInt16(byteOffset);
        byteOffset += Int16Array.BYTES_PER_ELEMENT;

        //go ever the buffer and deserialize items
        while (byteOffset < worldData.byteLength) {
            var objectClassId = worldDataDV.getUint8(byteOffset);
            var objectClass = gameEngine.registeredClasses[objectClassId];

            if (objectClass == null){
                console.warn(`Object with class id ${objectClassId} not found! Did you forget to register it with the game engine?`);
            }

            var objectByteSize = objectClass.getNetSchemeBufferSize(objectClass);

            var object = Serializable.deserialize(objectClass, worldData.slice(byteOffset, byteOffset + objectByteSize));
            world.objects[object.id] = object;
            byteOffset += objectByteSize;

        }

        return world;
    }

}

module.exports = GameWorld;
