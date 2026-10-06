import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { claimsWith, KeycloakDouble, startAuth } from '../testing/keycloak-double';
import { RtIfPermissionDirective } from './if-permission.directive';

@Component({
    selector: 'rt-test-host',
    imports: [RtIfPermissionDirective],
    template: `
        <p class="always">Always</p>
        <a *rtIfPermission="'orders:write'" class="write">New order</a>
        <section *rtIfPermission="{ some: ['orders:read', 'orders:write'] }" class="any">Orders</section>
    `,
})
class TestHostComponent {}

describe('RtIfPermissionDirective', () => {
    it('SC-AUTH-35 — a block shown by a right follows the rights', async () => {
        const double: KeycloakDouble = new KeycloakDouble();
        double.signIn(claimsWith(['orders:read']));
        await startAuth(double);
        const fixture: ComponentFixture<TestHostComponent> = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        const root: HTMLElement = fixture.nativeElement as HTMLElement;

        expect(root.querySelector('.always')).not.toBeNull();
        expect(root.querySelector('.any')).not.toBeNull();
        expect(root.querySelector('.write')).toBeNull();

        double.refreshWith(claimsWith(['orders:read', 'orders:write']));
        fixture.detectChanges();
        expect(root.querySelector('.write')).not.toBeNull();

        double.refreshWith(claimsWith([]));
        fixture.detectChanges();
        expect(root.querySelector('.always')).not.toBeNull();
        expect(root.querySelector('.write')).toBeNull();
        expect(root.querySelector('.any')).toBeNull();
    });
});
