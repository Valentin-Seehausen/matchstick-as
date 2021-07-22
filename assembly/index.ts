import { log } from "./log";

export { clearStore } from "./store";
export { assert } from "./assert";
export { addMetadata } from "./event";

const CLASS_IN_FINISHED_STATE_ERROR_MESSAGE = "You can't modify a MockedFunction instance after it has been saved.";
let hashAndReturnValue = new Map<i32, string>();

export declare function registerTest(name: string): void;

export function test(name: string, f: () => void): void {
    registerTest(name);
    f();
}

export class MockedContract {
    address: string;

    static bind(address: string): MockedContract {
        let contract = new MockedContract();
        contract.address = address;
        return contract;
    }

    callFunction(fnName: string, fnArgs: string []): string {
        let hash = createHash(this.address, fnName, fnArgs);
        if (hashAndReturnValue.has(hash)) {
            return hashAndReturnValue.get(hash);
        }
        log.error(
            "No function with name '" +
            fnName +
            "', contract address '" +
            this.address +
            "' and given arguments found."
        );
        return "";
    }
}

export class MockedFunction {
    isFinishedState: bool = false;
    contractAddress: string;
    name: string;
    args: string[];

    constructor(contractAddress: string, fnName: string) {
        this.contractAddress = contractAddress;
        this.name = fnName;
    }

    withArgs(args: string[]): MockedFunction {
        if (!this.isFinishedState) {
            this.args = args;
        } else {
            log.critical(CLASS_IN_FINISHED_STATE_ERROR_MESSAGE);
        }
        return this;
    }

    returns(returnValue: string): void {
        if (!this.isFinishedState) {
            hashAndReturnValue.set(createHash(this.contractAddress, this.name, this.args), returnValue);
            this.isFinishedState = true;
        } else {
            log.critical(CLASS_IN_FINISHED_STATE_ERROR_MESSAGE);
        }
    }

    reverts(): void {
        if (!this.isFinishedState) {
            hashAndReturnValue.set(createHash(this.contractAddress, this.name, this.args), "");
            this.isFinishedState = true;
        } else {
            log.critical(CLASS_IN_FINISHED_STATE_ERROR_MESSAGE);
        }
    }
}

export function mockFunction(
    contractAddress: string,
    fnName: string
): MockedFunction {
    return new MockedFunction(contractAddress, fnName);
}

function createHash(
    address: string,
    fnName: string,
    fnArguments: string[],
): i32 {
    let stringToHash = address + fnName;
    for (let i = 0; i < fnArguments.length; i++) {
        stringToHash.concat(fnArguments[i]);
    }

    let hash = 0;
    if (stringToHash.length == 0) {
        return hash;
    }

    for (let i = 0; i < stringToHash.length; i++) {
        let char = stringToHash.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }

    return hash;
}
