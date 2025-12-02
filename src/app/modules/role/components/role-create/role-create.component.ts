import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RoleService } from '../../services/role.service';
import { Router } from '@angular/router';
import { IRoleModel } from '../../models/IRoleModel';
import { IAspNetPageModel } from 'src/app/modules/page-management/models/IAspNetPageModel';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';

@Component({
    selector: 'app-role-create',
    templateUrl: './role-create.component.html',
    styleUrl: './role-create.component.scss',
})
export class RoleCreateComponent {
    tableLoadingSpinner: boolean = true;

    unsubscribe: Subscription[] = [];
    permessions: IAspNetPageModel[] = [];
    roleModel: IRoleModel = {
        name: '',
        permissionsCount: 0,
        users: [],
        usersCount: 0,
        permessions: [],
        id: '',
        isActive: false,
        isTenantRole: false,
        isTenantAdministratorRole: false,
    };
    constructor(
        private apiService: RoleService,
        private router: Router,
        private tableLoadingService: TableLoadingService
    ) {}

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
        this.tableLoadingService.show();

        const x = this.apiService.getAllPagesWithItems().subscribe({
            next: (res) => {
                this.permessions = res;
                this.tableLoadingService.hide();
            },
            error: (err) => {},
        });
        this.unsubscribe.push(x);
    }

    onSubmit() {
        this.getPermessionChecked();
        const x = this.apiService.createRole(this.roleModel).subscribe({
            next: (res) => {
                this.router.navigateByUrl('/roles');
            },
            error: (error) => {},
        });
    }

    getPermessionChecked(): void {
        this.permessions.forEach((perm) => {
            perm.pageItems!.forEach((pageItem) => {
                let element = document.getElementById(`${pageItem.id}`) as HTMLInputElement;
                if (element && element.type === 'checkbox' && element.checked) {
                    this.roleModel.permessions.push(element.value);
                }
            });
        });
    }
    updatePermissions(event: any, itemId: any): void {
        if (event.checked) {
            this.roleModel.permessions.push(itemId);
        } else {
            const index = this.roleModel.permessions.indexOf(itemId);
            if (index !== -1) {
                this.roleModel.permessions.splice(index, 1);
            }
        }
    }
    ngOnDestroy(): void {
        this.unsubscribe.forEach((e) => {
            e.unsubscribe();
        });
    }
}
