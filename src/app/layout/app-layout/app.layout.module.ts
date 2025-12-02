import { NgModule } from '@angular/core';
import { AppLayoutComponent } from './app.layout.component';
import { AppBreadcrumbComponent } from '../app-breadcrumb/app.breadcrumb.component';
import { AppMenuProfileComponent } from '../app-menuProfile/app.menuprofile.component';
import { AppTopbarComponent } from '../top-bar/app.topbar.component';
import { AppRightMenuComponent } from '../app-rightMenu/app.rightmenu.component';
import { AppMenuComponent } from '../app-menu/app.menu.component';
import { AppMenuitemComponent } from '../app-menu/app.menuitem.component';
import { AppSidebarComponent } from '../app-sidebar/app.sidebar.component';
import { AppFooterComponent } from '../app-footer/app.footer.component';
import { SupportTabmenuComponent } from '../support-tabmenu/support-tabmenu.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { SidebarModule } from 'primeng/sidebar';
import { StyleClassModule } from 'primeng/styleclass';
import { TooltipModule } from 'primeng/tooltip';
import { AppConfigModule } from '../config/app.config.module';
import { TabViewModule } from 'primeng/tabview';
import { SharedModule } from '../../Shared/shared/shared.module';
import { MyTicketCardComponent } from '../my-ticket-card/myticket-card.component';
import { MyTicketChatBoxComponent } from '../my-ticket-chat-box/my-ticket-chat-box.component';
import { AllTicketCardComponent } from '../all-ticket-card/all-ticket-card.component';
import { AllTicketChatBoxComponent } from '../all-ticket-chat-box/all-ticket-chat-box.component';
import { NoInternetOverlayComponent } from '../no-internet-overlay/no-internet-overlay.component';

@NgModule({
    declarations: [
        AppLayoutComponent,
        AppBreadcrumbComponent,
        AppMenuProfileComponent,
        AppTopbarComponent,
        AppRightMenuComponent,
        AppMenuComponent,
        AppSidebarComponent,
        AppMenuitemComponent,
        AppFooterComponent,
        SupportTabmenuComponent,
        MyTicketCardComponent,
        MyTicketChatBoxComponent,
        AllTicketCardComponent,
        AllTicketChatBoxComponent,
        NoInternetOverlayComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        StyleClassModule,
        InputTextModule,
        SidebarModule,
        BadgeModule,
        RadioButtonModule,
        InputSwitchModule,
        TooltipModule,
        MegaMenuModule,
        RippleModule,
        RouterModule,
        ButtonModule,
        MenuModule,
        AppConfigModule,
        MenuModule,
        TabViewModule,
        SharedModule,
    ],
})
export class AppLayoutModule {}
