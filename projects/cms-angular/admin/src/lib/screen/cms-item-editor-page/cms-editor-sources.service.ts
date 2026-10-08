import { Injectable, inject } from '@angular/core';

import { Observable, map } from 'rxjs';

import { IBlock, sitePathOf } from '@rt-tools/cms-contract';
import {
    CMS_SITE_ADDRESS,
    IContentItemList,
    IContentItemListRow,
    IContentTypeRow,
    IPickedMediaFile,
    ISiteAddress,
} from '@rt-tools/cms-angular';
import { RtDialogService } from '@rt-tools/ui-kit-v2';

import { ContentItemsApiService } from '../../api/content-items-api.service';
import { ContentTypesApiService } from '../../api/content-types-api.service';
import {
    ICmsEditorContentItem,
    ICmsEditorContentSource,
    ICmsEditorContentType,
    ICmsEditorImagePicker,
} from '../../editor/cms-editor.tokens';
import { openMediaPickerDialog } from '../../media/cms-media-picker-dialog/cms-media-picker-dialog.component';

/** The pages for the editor links come from the CMS server: the types and the search by name inside a type. */
@Injectable()
export class CmsEditorContentSourceService implements ICmsEditorContentSource {
    readonly #types: ContentTypesApiService = inject(ContentTypesApiService);
    readonly #items: ContentItemsApiService = inject(ContentItemsApiService);
    readonly #site: ISiteAddress = inject(CMS_SITE_ADDRESS);

    public contentTypes(): Observable<ICmsEditorContentType[]> {
        return this.#types
            .contentTypes()
            .pipe(
                map((types: IContentTypeRow[]): ICmsEditorContentType[] =>
                    types.map((type: IContentTypeRow): ICmsEditorContentType => ({ id: type.id, name: type.name }))
                )
            );
    }

    public search(contentTypeId: string, search: string): Observable<ICmsEditorContentItem[]> {
        return this.#items.search(contentTypeId, search).pipe(
            map((page: IContentItemList): ICmsEditorContentItem[] =>
                page.items.map((item: IContentItemListRow): ICmsEditorContentItem => ({
                    contentTypeId,
                    id: item.id,
                    name: item.name,
                    path: sitePathOf('', item.slug, this.#site.sectionRoot),
                }))
            )
        );
    }
}

/** The editor images are picked by the media library picker window. */
@Injectable()
export class CmsEditorImagePickerService implements ICmsEditorImagePicker {
    readonly #dialogs: RtDialogService = inject(RtDialogService);

    public pick(): Observable<IBlock.Content.Image[] | undefined> {
        return openMediaPickerDialog(this.#dialogs).pipe(
            map((file: IPickedMediaFile | undefined): IBlock.Content.Image[] | undefined =>
                file === undefined ? undefined : [{ fileId: file.fileId, imageUrl: file.url }]
            )
        );
    }
}
