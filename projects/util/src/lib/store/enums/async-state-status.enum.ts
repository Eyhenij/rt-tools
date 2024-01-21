/**
 * @description Enumeration indicates the current state of a request.
 * @value ModelStatus.Success - The request was successful.
 * @value ModelStatus.Error - The request failed.
 * @value ModelStatus.Init - The request has not been made yet.
 * @value ModelStatus.Pending - The request is in progress.
 */
export enum ModelStatus {
    Init,
    Pending,
    Success,
    Error
}
