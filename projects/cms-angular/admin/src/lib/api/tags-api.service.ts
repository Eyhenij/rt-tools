import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import { Tag } from '@rt-tools/cms-contract';
import { ITagNode } from '@rt-tools/cms-angular';

import { tagNodeOf } from './cms-contract-mapping.function';
import { TagsApiFacade } from './tags-api.facade';

/** The tags in the CMS notions. The contract type does not go past this class. */
@Injectable({ providedIn: 'root' })
export class TagsApiService {
    readonly #facade: TagsApiFacade = inject(TagsApiFacade);

    public tags(): Observable<ITagNode[]> {
        return this.#facade.listTags().pipe(map((answer: { tags: Tag[] }) => answer.tags.map(tagNodeOf)));
    }

    public save(id: string, name: string, parentId: string): Observable<void> {
        return this.#facade.saveTag(id, name, parentId).pipe(map((): void => undefined));
    }

    public remove(tagId: string): Observable<void> {
        return this.#facade.deleteTag(tagId).pipe(map((): void => undefined));
    }
}
