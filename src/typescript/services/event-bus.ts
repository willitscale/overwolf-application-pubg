import { TopicNames } from "../constants/topic-names";
import { EventNames } from "../constants/event-names";

export interface Subscriptions {
  [key: string]: {
    topics: string[]|string,
    events: string[]|string,
    callback: (topic: string, event: string, data: any) => void
  }
};

export class EventBus {

  public static readonly WILDCARD: string = '*';
  private readonly subscriptions: Subscriptions = {};

  private constructor() {
  }

  static get instance(): EventBus {
    if (!(<any>overwolf.windows.getMainWindow()).pubgistics_eventBus) {
      (<any>overwolf.windows.getMainWindow()).pubgistics_eventBus = new EventBus;
    }
    return (<any>overwolf.windows.getMainWindow()).pubgistics_eventBus;
  }

  public subscribe(key: string, topics: string[]|string, events: string[]|string, callback: (topic: string, event: string, data: any) => void): void {
    this.subscriptions[key] = {
      topics: topics,
      events: events,
      callback: callback
    };
  }

  public publish(topic: string, event: string, data: any): void {
    //console.log(topic, event, data);
    for (let i in this.subscriptions) {
      if (TopicNames.TopicWildcard != this.subscriptions[i].topics && topic != this.subscriptions[i].topics && (typeof this.subscriptions[i].topics !== "string" || !this.subscriptions[i].topics.includes(topic))) {
        continue;
      }

      if (EventNames.EventWildcard != this.subscriptions[i].events && event != this.subscriptions[i].events && (typeof this.subscriptions[i].events !== "string" || !this.subscriptions[i].events.includes(event))) {
        continue;
      }
      
      this.subscriptions[i].callback(topic, event, data);
    }
  }
}
