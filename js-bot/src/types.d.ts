type Action = () => void;

type Func<TA, TR = void> = (TA) => TR;

type DirectionType = 0 | 1;

interface IMessage {
    readonly id: string;
    readonly direction: DirectionType;
    readonly from: string;
    readonly content: string;
}

type ContactType = 0 | 1 | 2 | 3 | 4 | 5;

type LogLevel = 0 | 1 | 2 | 3;

interface IHandler {
    onMessage: (c: Contact, m: Message) => any,
    onCqEvent: (data: any) => any,
}