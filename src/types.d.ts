type Action = () => void;

type Func<TA, TR = void> = (TA) => TR;

interface IMessage {
    readonly id: string;
    readonly from: string;
    readonly content: string;
    readonly isIn: boolean;
}

type ContactType = 0 | 1 | 2;

type LogLevel = 0 | 1 | 2 | 3;