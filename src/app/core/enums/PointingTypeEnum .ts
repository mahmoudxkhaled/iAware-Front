export enum PointingTypeEnum {
    CorrectAnswer = 1, // Value = 1 DONE
    CorrectAnswerGame  , // Value = 2
    CompletingAwarenessVideoORComicBook , // Value = 5 DONE
    PhishingReport  , // Value = 10
    PhishingFailureClickedORQRcodeScanned  , // Value = -5 DONE
    PhishingFailureAttachement  , // Value = -10
    PhishingFailureEnteringDataWithoutSubmitting  , // Value = -5
    PhishingFailureEnteringDataWithSubmitting  , // Value = -10 DONE
    PhishingFailureReplied   // Value = -10
}