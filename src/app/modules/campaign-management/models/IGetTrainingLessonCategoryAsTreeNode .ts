export interface IGetTrainingLessonCategoryAsTreeNode {
    key?: string;
    label?: string;
    data?: string;
    icon?: string;
    parent?: IGetTrainingLessonCategoryAsTreeNode;
    children?: IGetTrainingLessonCategoryAsTreeNode[];
}