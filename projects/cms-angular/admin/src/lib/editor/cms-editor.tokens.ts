import { InjectionToken } from '@angular/core';

import { Observable } from 'rxjs';

import { IBlock } from '@rt-tools/cms-contract';

/** A page in the link window: where the link leads and how to name it to the person. */
export interface ICmsEditorContentItem {
    id: string;
    contentTypeId: string;
    name: string;
    /** The page address on the site — it goes into the link `href`. */
    path: string;
}

/** A content type in the link window: pages are searched inside the chosen type. */
export interface ICmsEditorContentType {
    id: string;
    name: string;
}

/** Where the editor takes pages for links from. The editor knows no server client: the screen it stands on gives the source. */
export interface ICmsEditorContentSource {
    contentTypes(): Observable<ICmsEditorContentType[]>;
    search(contentTypeId: string, search: string): Observable<ICmsEditorContentItem[]>;
}

/** Where the editor takes images from: it opens the media library picking and gives the picked files, or `undefined` if closed without an answer. */
export interface ICmsEditorImagePicker {
    pick(): Observable<IBlock.Content.Image[] | undefined>;
}

export const CMS_EDITOR_CONTENT_SOURCE: InjectionToken<ICmsEditorContentSource> = new InjectionToken<ICmsEditorContentSource>(
    'CMS_EDITOR_CONTENT_SOURCE'
);

export const CMS_EDITOR_IMAGE_PICKER: InjectionToken<ICmsEditorImagePicker> = new InjectionToken<ICmsEditorImagePicker>(
    'CMS_EDITOR_IMAGE_PICKER'
);
