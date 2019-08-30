type GameEvent = {

}

interface EventData {

}

enum GameEventTypes {
    message,
    place,
    move,
    music,
    sound,
    animation,
    itemAction,
    spawnItem

}

abstract class BaseEvent {

}

export class EventStream{
    /**
     * A series of Events.  Handles iterating through each event.
     */
    constructor() {
        
    }
    public start(){

    }

    public nextEvent(){

    }
}

export class EventManager{
    /**
     * Retrieves and plays EventStreams.
     * 
     */
    constructor(private scene: Phaser.Scene) {
        
    }
}