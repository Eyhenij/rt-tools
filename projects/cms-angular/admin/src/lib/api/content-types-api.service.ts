import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import { ContentType } from '@rt-tools/cms-contract';
import { IContentTypeRow } from '@rt-tools/cms-angular';

import { contentTypeRowOf, required } from './cms-contract-mapping.function';
import { ContentTypesApiFacade } from './content-types-api.facade';

const CONTENT_TYPE: string = 'the content type';

/** The content types in the CMS notions. The contract type does not go past this class. */
@Injectable({ providedIn: 'root' })
export class ContentTypesApiService {
    readonly #facade: ContentTypesApiFacade = inject(ContentTypesApiFacade);

    public contentTypes(): Observable<IContentTypeRow[]> {
        return this.#facade
            .listContentTypes()
            .pipe(map((answer: { contentTypes: ContentType[] }) => answer.contentTypes.map(contentTypeRowOf)));
    }

    public contentType(contentTypeId: string): Observable<IContentTypeRow> {
        return this.#facade
            .getContentType(contentTypeId)
            .pipe(map((answer: { contentType?: ContentType }) => contentTypeRowOf(required(answer.contentType, CONTENT_TYPE))));
    }

    public save(type: IContentTypeRow): Observable<IContentTypeRow> {
        return this.#facade
            .updateContentType(type.id, type.name, type.description, type.settings)
            .pipe(map((answer: { contentType?: ContentType }) => contentTypeRowOf(required(answer.contentType, CONTENT_TYPE))));
    }
}
