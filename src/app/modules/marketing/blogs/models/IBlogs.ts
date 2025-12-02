export interface IBlogCategory {
    id: string;
    title: string;
    imageUrl: string;
    isActive: boolean;
    languageId: string;
    languageName: string;

    blogCategoryPosts?: IBlogCategoryPost[];
    blogCategoryLanguages?: IBlogCategoryLanguage[];
}


export interface IBlogCategoryLanguage {
    id: string;
    title: string;
    imageUrl: string;

    languageId: string;
    languageName: string;

    blogCategoryId: string;

    isActive: boolean;

}

export interface IBlogCategoryPost {
    id: string;
    postTitle: string;
    imageUrl: string;
    writerName: string;
    postDetailHtml: string;
    description: string;
    publishingDate: string;
    languageId: string;
    languageName: string;
    blogCategoryId: string;
    isActive: boolean;
    tagIds: string[]
    blogCategoryPostLanguages?: IBlogCategoryPostLanguage[];
    blogCategoryPostTags?: IBlogCategoryPostTag[];
    blogCategoryPostComments?: IBlogCategoryPostComment[];
}


export interface IBlogCategoryPostLanguage {
    id: string;
    postTitle: string;
    imageUrl: string;
    writerName: string;
    postDetailHtml: string;
    description: string;

    languageId: string;
    languageName: string;

    blogCategoryPostId: string;
    isActive: boolean;
}



export interface IBlogCategoryPostComment {
    id: string;
    commentUserName: string;
    commentFullText?: string;
    userProfileImageUrl?: string;
    userEmail?: string;
    userWebsite?: string;
    blogCategoryPostId: string;
    parentBlogCategoryPostCommentId?: string;
}

export interface IBlogCategoryPostTag {
    id: string;
    tagId: string;
    blogCategoryPostId: string;
}

