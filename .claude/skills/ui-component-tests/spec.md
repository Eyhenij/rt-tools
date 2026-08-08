# Спека компонента — готовый код

Куски отсюда переносятся в файл спеки рядом с исходником. Где что лежит в дереве и какой
прогонщик — при правиле `testing`, файл `implementation.md`.

## Первый кит: своя `setup()`

Обвязки в первом ките нет, сборщик фикстур пишется в файле спеки. Готовый вид:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('RtuiThingComponent', () => {
    function setup(): ComponentFixture<RtuiThingComponent> {
        TestBed.configureTestingModule({ imports: [RtuiThingComponent] });

        const fixture: ComponentFixture<RtuiThingComponent> = TestBed.createComponent(RtuiThingComponent);

        // Входы реактивные: присваивание полю экземпляра их не меняет.
        fixture.componentRef.setInput('size', 'md');
        fixture.detectChanges();

        return fixture;
    }

    /** Модификаторы блока висят на хосте — класс объявлен декоратором, а не разметкой. */
    function blockClasses(fixture: ComponentFixture<RtuiThingComponent>): DOMTokenList {
        return (fixture.nativeElement as HTMLElement).classList;
    }

    it('ставит модификатор размера на хост', () => {
        expect(blockClasses(setup()).contains('rtui-thing--size-md')).toBe(true);
    });
});
```

Мост к Material доказывается настоящим экземпляром директивы, а не поиском класса:

```typescript
fixture.debugElement.query(By.directive(MatButton))?.componentInstance;
```

## Второй кит: общая обвязка

```typescript
import { createRtFixture, hostClasses, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';

// Входы — вторым доводом; третий довод добавляет провайдеры и импорты поверх обвязки.
const fixture: ComponentFixture<RtThingComponent> = createRtFixture(RtThingComponent, { size: 'md' });

// `qa` ищет по якорю для спек; `textOf` и `classesOf` терпят `null` и отдают пустое —
// поэтому утверждение о тексте проверяется вместе с существованием узла.
expect(qa(fixture, 'thing-label')).not.toBeNull();
expect(textOf(qa(fixture, 'thing-label'))).toBe('Готово');
expect(hostClasses(fixture)).toContain('rt-thing--size-md');

// Пачка входов после подъёма — и своя перерисовка: обвязка её не гоняет.
setInputs(fixture, { size: 'lg', disabled: true });
fixture.detectChanges();
```

`provideRtKitTesting()` уже даёт то, без чего не поднимается ни один компонент: клиент запросов
с заглушкой, хранилище, `PlatformService`, хранилище настроек таблицы. Своё добавляется
`providers` в опциях, а не поверх обвязки.

## Вход от приложения проверяется хостом

Компонент, у которого вход перекрывает собственный замер, проверяется через хост-обёртку — и
значение в ней **реактивное**: у хоста перерисовка по требованию, и правка обычного поля
привязку не обновит.

```typescript
@Component({
    template: '<rtui-thing [isMobile]="mobileInput()" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtuiThingComponent],
})
class HostComponent {
    public readonly mobileInput: WritableSignal<boolean | null> = signal<boolean | null>(null);
}
```

## Двойник службы

Служба, объявленная без корневой области, подменяется у самого компонента — иначе двойник до
него не доедет:

```typescript
TestBed.overrideComponent(RtuiThingComponent, {
    set: { providers: [{ provide: BreakpointService, useValue: breakpoints }] },
});
```

Двойник пишется руками и отдаёт то, что сценарий просит:

```typescript
class BreakpointServiceStub {
    public readonly narrow: WritableSignal<boolean> = signal(false);

    public get isMobile(): Signal<boolean> {
        return this.narrow.asReadonly();
    }
}
```

## Четыре подмены, до которых не додуматься

- **Ширина окна ничего не измеряет.** Узкий вид достаётся подменой службы точек перелома, а не
  размером фикстуры: медиа-запрос в среде без окна не срабатывает вовсе.
- **Загрузчик переводов обязан вернуть поток.** Готовый объект гасится внутри, язык остаётся
  пустым, и проверка текста молча подтверждает пустую строку.
- **Редактор текста в среде без браузера не поднимается** и подменяется двойником; в подмене
  обязателен признак модуля, иначе вместо конструктора приходит объект.
- **Содержимое в перекрытии само не рисуется.** После открытия нужен `TestBed.inject(ApplicationRef).tick()`,
  и искать его надо по документу, а не по фикстуре.

## Среда без браузера

- `PointerEvent` нет — берётся `MouseEvent` с тем же именем события.
- `HTMLElement.scrollTo` нет.
- `currentColor` приходит в нижнем регистре.
- Служба темы кладёт выбор в хранилище — между тестами оно чистится.
- Стенд зоннезависимый: неизвестный элемент роняет спеку, а не рисует пустоту, — пропущенный
  импорт виден сразу.
