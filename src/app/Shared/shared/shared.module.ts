import { EmptyDataComponent } from '../components/empty-data/empty-data.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { RatingModule } from 'primeng/rating';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { CalendarModule } from 'primeng/calendar';
import { DividerModule } from 'primeng/divider';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { GalleriaModule } from 'primeng/galleria';
import { AppConfigModule } from 'src/app/layout/config/app.config.module';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ImageModule } from 'primeng/image';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabViewModule } from 'primeng/tabview';
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { PickListModule } from 'primeng/picklist';
import { TreeModule } from 'primeng/tree';
import { NgxEditorModule } from 'ngx-editor';
import { TabMenuModule } from 'primeng/tabmenu';
import { TreeTableModule } from 'primeng/treetable';
import { IAwarePdfComponent } from '../components/iAware-pdf/iAware-pdf.component';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DataViewModule } from 'primeng/dataview';
import { SpeedDialModule } from 'primeng/speeddial';
import { PanelModule } from 'primeng/panel';
import { MenuModule } from 'primeng/menu';
import { InplaceModule } from 'primeng/inplace';
import { FieldsetModule } from 'primeng/fieldset';
import { EditorModule } from 'primeng/editor';
import { TooltipModule } from 'primeng/tooltip';
import { IAwareRichTextComponent } from '../components/iAware-rich-text/iAware-rich-text.component';
import { SidebarModule } from 'primeng/sidebar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AvatarModule } from 'primeng/avatar';
import { ChartModule } from 'primeng/chart';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PasswordModule } from 'primeng/password';
import { TranslateModule } from '@ngx-translate/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { SplitterModule } from 'primeng/splitter';
import { NgxIntlTelInputModule } from '@justin-s/ngx-intl-tel-input';
import { ColorScemaSettingsComponent } from '../components/color-scema-settings/color-scema-settings.component';
import { GaugeChartComponent } from '../components/gauge-chart/gauge-chart.component';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { CloudflareStreamModule } from '@cloudflare/stream-angular';
import { ListboxModule } from 'primeng/listbox';
import { DeferModule } from 'primeng/defer';
import { TrainingCampaignsDashboardComponent } from '../components/training-campaigns-dashboard/training-campaigns-dashboard.component';
import { PhishingCampaignsDashboardComponent } from '../components/phishing-campaigns-dashboard/phishing-campaigns-dashboard.component';
import { TableLoadingSpinnerComponent } from '../components/table-loading-spinner/table-loading-spinner/table-loading-spinner.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LogoutComponent } from '../components/logout/logout.component';
import { IAwareInfoComponent } from '../components/iAware-info/iAware-info.component';
import { IAwareVariablesComponent } from '../components/iaware-variables/iaware-variables.component';
import { ChipModule } from 'primeng/chip';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TagFilterComponent } from '../components/tag-filter/tag-filter.component';
import { IawarePointsComponent } from '../components/iaware-points/iaware-points.component';
import { UserTrainingListDialogComponent } from '../components/training-campaigns-dashboard/components/user-training-list-dialog/user-training-list-dialog.component';
import { UserPhishingListDialogComponent } from '../components/phishing-campaigns-dashboard/components/user-phishing-list-dialog/user-phishing-list-dialog.component';
import { AccordionModule } from 'primeng/accordion';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';
const components = [
    TagFilterComponent,
    EmptyDataComponent,
    IAwarePdfComponent,
    IAwareRichTextComponent,
    ColorScemaSettingsComponent,
    GaugeChartComponent,
    TrainingCampaignsDashboardComponent,
    PhishingCampaignsDashboardComponent,
    TableLoadingSpinnerComponent,
    LogoutComponent,
    IAwareInfoComponent,
    IAwareVariablesComponent,
    IawarePointsComponent,
    UserTrainingListDialogComponent,
    UserPhishingListDialogComponent
];

const imports = [
    RippleModule,
    SkeletonModule,
    InputTextModule,
    ReactiveFormsModule,
    TableModule,
    ProgressBarModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    DropdownModule,
    FileUploadModule,
    InputTextareaModule,
    InputGroupModule,
    InputGroupAddonModule,
    MultiSelectModule,
    DialogModule,
    ToolbarModule,
    ToastModule,
    CheckboxModule,
    RatingModule,
    RadioButtonModule,
    InputNumberModule,
    InputSwitchModule,
    MessagesModule,
    CalendarModule,
    MessageModule,
    EditorModule,
    DividerModule,
    PdfViewerModule,
    PdfJsViewerModule,
    GalleriaModule,
    AppConfigModule,
    InputTextModule,
    ReactiveFormsModule,
    TableModule,
    ProgressBarModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    TabViewModule,
    RippleModule,
    InputTextModule,
    ConfirmDialogModule,
    DropdownModule,
    FileUploadModule,
    ColorPickerModule,
    ImageModule,
    StepsModule,
    CardModule,
    PickListModule,
    TreeModule,
    NgxEditorModule,
    TabMenuModule,
    TreeTableModule,
    ToggleButtonModule,
    ToggleButtonModule,
    DataViewModule,
    SpeedDialModule,
    PanelModule,
    MenuModule,
    InplaceModule,
    ProgressSpinnerModule,
    FieldsetModule,
    TooltipModule,
    SidebarModule,
    OverlayPanelModule,
    AvatarModule,
    ChartModule,
    ScrollPanelModule,
    PasswordModule,
    MonacoEditorModule,
    TranslateModule,
    CarouselModule,
    TagModule,
    SplitterModule,
    NgxIntlTelInputModule,
    AnimateOnScrollModule,
    CloudflareStreamModule,
    ListboxModule,
    DeferModule,
    SelectButtonModule,
    ChipModule,
    AutoCompleteModule,
    AccordionModule,
    PaginatorModule
];

const providers = [ConfirmationService, MessageService];

@NgModule({
    declarations: [...components],
    imports: [...imports],
    exports: [...imports, ...components],
    providers: [...providers],
})
export class SharedModule { }