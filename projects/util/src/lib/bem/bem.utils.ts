import { ElementRef, Renderer2 } from '@angular/core';

import { BEM_MODULE_CONFIG } from './bem.const';
import { ModsObject } from './bem.types';

export function modNameHandler(str: string): string {
    switch (BEM_MODULE_CONFIG.modCase) {
        case 'kebab':
            return str
                ? str
                      .replace(/[A-Z]/g, function (s: string) {
                          return '-' + s.toLowerCase();
                      })
                      .replace(/$-/, '')
                : '';
        case 'snake':
            return str
                ? str
                      .replace(/[A-Z]/g, function (s: string) {
                          return '_' + s.toLowerCase();
                      })
                      .replace(/$-/, '')
                : '';
        default:
            return str;
    }
}

export function generateClass(blockName: string, elemName?: string, modName?: string, modValue?: unknown): string {
    if (BEM_MODULE_CONFIG.ignoreValues) {
        modValue = !!modValue;
    }

    if (typeof modValue !== 'string' && typeof modValue !== 'boolean') {
        modValue = !!modValue;
    }

    let cls: string = blockName;

    if (elemName) {
        cls += BEM_MODULE_CONFIG.separators.el + elemName;
    }

    if (modName) {
        modName = modNameHandler(modName);
        cls += BEM_MODULE_CONFIG.separators.mod + modName;
        if (typeof modValue !== 'boolean' && modValue != null) {
            cls += BEM_MODULE_CONFIG.separators.val + modValue;
        }
    }

    return cls;
}

export function parseMods(mods?: string | string[] | ModsObject): ModsObject {
    if (typeof mods === 'string') {
        mods = mods.split(/\s+/);
    }

    if (Array.isArray(mods)) {
        const modsObj: ModsObject = {};

        mods.forEach((key: string) => {
            modsObj[key] = true;
        });
        mods = modsObj;
    } else if (typeof mods !== 'object') {
        return {};
    }

    return mods;
}

export function setMods(
    blockName: string,
    elemName: string,
    mods: ModsObject,
    oldMods: ModsObject,
    element: ElementRef,
    renderer: Renderer2
): void {
    Object.keys(mods).forEach((key: string) => {
        if (oldMods[key]) {
            if (mods[key] === oldMods[key]) {
                return;
            }

            renderer.removeClass(element.nativeElement, generateClass(blockName, elemName, key, oldMods[key]));
        }

        if (mods[key]) {
            renderer.addClass(element.nativeElement, generateClass(blockName, elemName, key, mods[key]));
        }
    });

    Object.keys(oldMods).forEach((key: string) => {
        if (!(key in mods) && oldMods[key]) {
            renderer.removeClass(element.nativeElement, generateClass(blockName, elemName, key, oldMods[key]));
        }
    });
}
