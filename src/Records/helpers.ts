import * as UIMessage from "N/ui/message";

export namespace UI {
    export function showMessage(title, message, duration = 5000, type = UIMessage.Type.WARNING) {
        UIMessage.create({
            title: title,
            message: message,
            type: type
        }).show({duration: duration});
    }
}