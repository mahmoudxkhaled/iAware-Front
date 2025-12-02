export interface INewsCategory {
    id: string;
    title: string;
    imageUrl: string;
    isActive: boolean;
    languageId: string;
    languageName: string;

    newsCategoryArticles?: INewsCategoryArticle[];
    newsCategoryLanguages?: INewsCategoryLanguage[];
}


export interface INewsCategoryLanguage {
    id: string;
    title: string;
    imageUrl: string;

    languageId: string;
    languageName: string;

    newsCategoryId: string;

    isActive: boolean;

}

export interface INewsCategoryArticle {
    id: string;
    articleTitle: string;
    imageUrl: string;
    writerName: string;
    articleText: string;
    description: string;
    publishingDate: string;
    languageId: string;
    languageName: string;
    newsCategoryId: string;
    isActive: boolean;
    tagIds: string[]
    newsCategoryArticleLanguages?: INewsCategoryArticleLanguage[];
    newsCategoryArticleTags?: INewsCategoryArticleTag[];
}


export interface INewsCategoryArticleLanguage {
    id: string;
    articleTitle: string;
    imageUrl: string;
    writerName: string;
    articleText: string;
    description: string;

    languageId: string;
    languageName: string;

    newsCategoryArticleId: string;
    isActive: boolean;
}

export interface INewsCategoryArticleTag {
    id: string;
    tagId: string;
    newsCategoryArticleId: string;
}

