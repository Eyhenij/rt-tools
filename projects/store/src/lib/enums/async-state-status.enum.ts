/**
 * @description Enumeration indicates the current state of a request.
 * @value EModelStatus.Success - The request was successful.
 * @value EModelStatus.Error - The request failed.
 * @value EModelStatus.Init - The request has not been made yet.
 * @value EModelStatus.Pending - The request is in progress.
 */
export enum EModelStatus {
    Init,
    Pending,
    Success,
    Error,
}
