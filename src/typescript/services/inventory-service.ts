import { EventBus } from "./event-bus";
import { EventNames } from "../constants/event-names";
import { TopicNames } from "../constants/topic-names";

export class InventoryService {

    private hasLeftPlane: boolean = false;

    private equipped: any = {};
    private inventory: any = {};

    static get instance(): InventoryService {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_inventory_service) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_inventory_service = new InventoryService;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_inventory_service;
    }

    public listen(): void {
        let events = [
            EventNames.GameEventPhaseFreeFly,
            EventNames.GameEventMe
        ];

        EventBus.instance.subscribe('inventory-service', TopicNames.GameEvent, events, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.GameEventPhaseFreeFly:
                this.hasLeftPlane = true;
                break;
            case EventNames.GameEventMe:
                if (data.inventory && this.hasLeftPlane) {
                    this.parse(data.inventory);
                }
                break;
        }
    }

    private parse(data: any): void {
        for (let position in data) {
            if (position.includes('equipped_')) {
                this.itemEquipped(position, data[position]);
            } else if (position.includes('inventory_')) {
                this.itemCollected(position, data[position]);
            }
        }
    }

    private itemEquipped(position: string, item: any): void {
        this.equipped[position] = item;
        if (item.name) {
            EventBus.instance.publish(TopicNames.Inventory, EventNames.InventoryItemEquipped, item);
        } else {
            EventBus.instance.publish(TopicNames.Inventory, EventNames.InventoryItemUnequipped, item);
        }
    }

    private itemCollected(position: string, item: any): void {
        this.inventory[position] = item;
        if (!item || !item.name) {
            EventBus.instance.publish(TopicNames.Inventory, EventNames.InventoryItemCollected, item);
        } else {
            EventBus.instance.publish(TopicNames.Inventory, EventNames.InventoryItemDropped, item);
        }
    }
}
