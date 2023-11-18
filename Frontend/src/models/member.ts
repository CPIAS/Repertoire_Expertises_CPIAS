export interface Member {
    userId: number;
    lastName: string;
    firstName: string;
    email: string;
    registrationDate: string;
    affiliationOrganization: string;
    affiliationOrganizationOther: string;
    communityInvolvement: string;
    jobPosition: string;
    membershipCategory: string;
    membershipCategoryOther: string;
    skills: string;
    suggestions: string;
    yearsExperienceHealthcare: number;
    yearsExperienceIa: number;
    tags: string;
    profilePhoto?: string;
}

export interface ResultsMembers {
    category: string;
    recommendation: Recommendation[];
}

export interface Recommendation {
    expert: Member;
    score: number;
}
