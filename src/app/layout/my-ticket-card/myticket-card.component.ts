import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IHelpCategoryTicketModel } from '../api/IHelpCategoryTicketModel';
import { MenuItem } from 'primeng/api';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';

@Component({
    selector: 'app-myTicket-card',
    templateUrl: './myTicket-card.component.html',
    styleUrl: './myTicket-card.component.scss',
})
export class MyTicketCardComponent {
    @Input() ticket: IHelpCategoryTicketModel;
    @Output() CardClicked: EventEmitter<IHelpCategoryTicketModel> = new EventEmitter<IHelpCategoryTicketModel>();
    @Output() ForwardCardClicked: EventEmitter<IHelpCategoryTicketModel> = new EventEmitter<IHelpCategoryTicketModel>();
    menuItems: MenuItem[] = [];
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions
    
    constructor(private permessionService: PermessionsService) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.supportTapMenue);
    }

    changeView(ticket: IHelpCategoryTicketModel) {
        this.CardClicked.emit(ticket);
    }

    forwardTicket(ticket : IHelpCategoryTicketModel){
        this.ForwardCardClicked.emit(ticket);
    }   
    
    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }
}