import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IHelpCategoryTicketModel } from '../api/IHelpCategoryTicketModel';
import { Message } from 'primeng/api';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { MyTicketChatBoxService } from '../app-services/my-ticket-chat-box.service';
import { ChatHubService } from 'src/app/core/Services/ChatHub.service';
import { IHelpCategoryTicketActivitiesModel } from '../api/IHelpCategoryTicketActivitiesModel';
import { IHelpCategoryStatusModel } from '../api/IHelpCategoryStatusModel';
import { FileDownloadService } from 'src/app/core/Services/file-download.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-my-ticket-chat-box',
    templateUrl: './my-ticket-chat-box.component.html',
    styleUrl: './my-ticket-chat-box.component.scss',
})
export class MyTicketChatBoxComponent implements OnChanges, AfterViewChecked, OnInit, OnDestroy {
    currentUserId: string;
    isChatClosed: boolean = false;
    @ViewChild('chatWindow') chatWindow: ElementRef;
    @Input() ticket: IHelpCategoryTicketModel;
    message!: Message;
    textContent: string = '';
    status: IHelpCategoryStatusModel[] = [];
    currentTicketId: string | null = null;
    currentStatusSelected: IHelpCategoryStatusModel;
    currentdUserData: any;
    selectedFile: File | null;
    fileUploderText: string;
    isDefaultTenantUser: boolean = false;
    isUserDataLoaded: boolean = false;
    constructor(
        private localStorageService: LocalStorageService,
        private apiService: MyTicketChatBoxService,
        private cdr: ChangeDetectorRef,
        private chatHubService: ChatHubService,
        private ref: ChangeDetectorRef,
        private fileDownloadService: FileDownloadService,
    ) {
        const userData = localStorageService.getCurrentUserData();
        this.currentdUserData = userData;
        this.currentUserId = userData != null ? userData?.userId : '';
        this.isDefaultTenantUser = userData?.isDefaultTenantUser || false; // Set here, guaranteed before rendering
        this.isUserDataLoaded = true; // Set flag if needed
        this.chatHubService._hubConnection.on('ReceiveMessage', (message) => {
            this.handleIncomingMessage(message);
        });


    }

    ngOnDestroy(): void { }

    ngAfterViewChecked(): void {
        this.cdr.detectChanges();
    }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.isUserDataLoaded) {
            this.isChatClosed = false;
            this.textContent = ''; // Clear the text box when chat opens (ticket changes)
            this.selectedFile = null; // Optional: Clear selected file as well
            this.fileUploderText = ''; // Optional: Clear file uploader text
            this.fetchTicketActivities();
            this.fetchTicketStatus();
        }
    }

    fetchTicketActivities() {
        if (this.ticket) {
            this.apiService.getTicketActivities(this.ticket.id).subscribe({
                next: (activities) => {
                    this.ticket.helpCategoryTicketActivities = activities.data;
                    this.checkIfChatClosed(this.ticket.helpCategoryTicketActivities);
                    this.cdr.detectChanges();
                    this.scrollToBottom();
                },
                error: (error) => {
                    console.error(error);
                },
            });
        }
    }

    fetchTicketStatus() {
        if (this.ticket) {
            this.apiService.getTicketStatusForCategory(this.ticket.helpCategoryId).subscribe({
                next: (status) => {
                    this.status = status.data;
                },
                error: (error) => {
                    console.error(error);
                },
            });
        }
    }


    sendMessage() {
        const trimmedText = this.textContent.trim();

        console.log('Selected file:', this.selectedFile);
        // Check if either text or file is present, but not both (XOR condition)
        const hasText = trimmedText !== '';
        const hasFile = !!this.selectedFile; // Convert to boolean
        if (!(hasText !== hasFile)) { // XOR: true if only one is present, false if both or neither
            console.log('Invalid input: Must send either text or file, not both or neither');
            return;
        }

        const message: IHelpCategoryTicketActivitiesModel = {
            helpCategoryTicketId: this.ticket.id,
            languageId: this.ticket.languageId,
            insertedUserId: this.currentdUserData.userId,
            insertedTime: new Date(),
            reply: trimmedText || (this.selectedFile ? this.selectedFile.name : ''), // Use trimmed text or file name
            isRead: false,
            senderImageUrl: this.currentdUserData.userImageUrl,
            senderName: this.currentdUserData.userName,
            helpCategoryStatusId: this.currentStatusSelected?.id ?? null,
        };

        const formData = this.createMessage(trimmedText); // Pass trimmed text to createMessage
        this.apiService
            .sendMessage(formData)
            .pipe(
                finalize(() => {
                    this.chatHubService.sendMessage(message);
                })
            )
            .subscribe({
                next: (response) => {
                    this.selectedFile = null;
                    this.fileUploderText = '';
                    this.textContent = ''; // Clear text to ensure file-only

                    message.fileUrl = response.data.fileUrl;
                    this.cdr.detectChanges();
                    this.scrollToBottom();
                },
                error: (error) => {
                    console.error(error);
                    this.cdr.detectChanges();
                },
            });
        this.textContent = ''; // Clear the input after sending
    }

    checkIfChatClosed(activities?: IHelpCategoryTicketActivitiesModel[]) {
        if (activities && activities.length > 0) {
            const lastActivity = activities[activities.length - 1] as IHelpCategoryTicketActivitiesModel;
            if (lastActivity.helpCategoryStatusId != null) {
                const statusObject = this.status.find(
                    (c) => c.id === lastActivity.helpCategoryStatusId
                ) as IHelpCategoryStatusModel;
                if (statusObject?.isClosedCase) {
                    this.isChatClosed = true;
                }
            }
        }
    }

    createMessage(trimmedText: string) { // Accept trimmed text as parameter
        const formData = new FormData();
        formData.append('Reply', trimmedText || (this.selectedFile ? this.selectedFile.name : ''));
        formData.append('LanguageId', this.currentdUserData?.language);
        formData.append('HelpCategoryTicketId', this.ticket.id);
        if (this.selectedFile) {
            formData.append('File', this.selectedFile);
        }
        if (this.currentStatusSelected !== null && this.currentStatusSelected !== undefined) {
            formData.append('HelpCategoryStatusId', this.currentStatusSelected.id);
        }
        formData.append('SenderId', this.currentUserId);
        return formData;
    }

    onEmojiSelect(emoji: string) {
        this.textContent += emoji;
    }

    parseDate(timestamp: any) {
        return new Date(timestamp).toTimeString().split(':').slice(0, 2).join(':');
    }

    handleIncomingMessage(message: IHelpCategoryTicketActivitiesModel) {
        if (this.ticket && message.helpCategoryTicketId === this.ticket.id) {
            if (!this.ticket.helpCategoryTicketActivities) {
                this.ticket.helpCategoryTicketActivities = [];
            }
            this.checkIfChatClosed([message]);
            this.ticket.helpCategoryTicketActivities.push(message);
            this.cdr.detectChanges();
            this.scrollToBottom();
        }
    }

    private scrollToBottom() {
        if (this.chatWindow) {
            this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
        }
    }

    onStatusClicked(s: IHelpCategoryStatusModel) {
        this.textContent = s.title;
        this.currentStatusSelected = s;
        if (s.isClosedCase) {
            this.isChatClosed = true;
        }
        this.sendMessage();
    }

    downloadFile(fileSrc: string): void {
        this.fileDownloadService.downloadFile(fileSrc).subscribe();
    }

    onUploadFileClick() {
        const fileInput = document.getElementById('myticketActivityAttachmentsFile') as HTMLInputElement;
        fileInput.click();
    }

    onFileSelected(event: any) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.ref.detectChanges();
                this.fileUploderText = `${this.selectedFile!.name} - ${this.selectedFile!.size} bytes`;
                this.textContent = ''; // Clear text to ensure file-only
                this.sendMessage(); // Send message immediately after file is selected
            };
            reader.readAsDataURL(this.selectedFile);
        }
    }

    reopenChat() {
        this.isChatClosed = false;
        this.textContent = ''; // Optional: Clear text box when reopening chat
    }
}