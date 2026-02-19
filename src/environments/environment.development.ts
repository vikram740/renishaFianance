import { get } from "http";

export const environment = {
    production: false,
    // baseUrl: 'http://192.168.1.3:3000/api',
    // uploadUrl:'http://192.168.1.3:3000/'
    baseUrl: 'http://localhost:3000/api',
    uploadUrl: 'http://localhost:3000/'
};

export const renishaFinance = {
    login: '/user/login',
    signup: '/user/signup',
    getAllAgents: '/agent/getAgents',
    getSingleAgent: '/agent/getAgentById',
    editAgent: '/agent/editAgent',
    deleteAgent: '/agent/deleteAgent',
    searchAgent: '/agent/searchAgent',
    createMember: '/member/createMember',
    getAllMembers: '/member/getMembers',
    getsingleMember: '/member/getMemberById',
    editMember: '/member/editMember',
    deletemember: '/member/deleteMember',
    searchMember: '/member/searchMember',
    createNominee: '/member/createMember',
    getAllNominees: '/nominee/getNominees',
    getSingleNominee: '/nominee/getNomineeById',
    editNominee: '/nominee/editNominee',
    deleteNominee: '/nominee/deleteNominee',
    Collection: '/collection/createCollection',
    getAllCollections: '/collection/getcollections',
    createCollectionAgent: '/agent/createAgent',
    createReferralAgent: '/referral/createReferral',
    getReferralById: "/referral/getReferralById",
    createDeal: '/deals/createDeals',
    getAllDeals:'/deals/getAllDeals',
    // getAllDeals: '/deals/draft/getAllDealsDrafts',

    getSingleDealById: '/deals/getDealById',
    deleteDeal: '/deals/deleteDeal',
    createQrCode: '/qrcodes/createQrCodes',
    getAllQr: '/qrcodes/getAllQrCodes',
    setPrimary: '/qrcodes/UpdateQrCodePrimary',
    deleteQr: '/qrcodes/deleteQRcode',
    createDealCollection: '/dealsCollection/createDealsCollection',
    getDealCollection: '/dealsCollection/getDealsCollectionList',
    getDealInsallment: '/dealsCollection/getDealInstallments',
    deleteDealCollection: "/dealsCollection/deleteDealCollection",
    userList: '/user/usersList',
    updateUser: '/user/updateUser',
    deleteUser: '/user/deleteUserById',
    userDetailsById: '/user/userDetailsById',
    uploads: 'uploads',
    dashBoard: '/deals/getDashboardSummary',
    createManualForm: '/manualForm/createManualForm',
    manualCollection: '/manualForm/addDealTransaction',
    document: "/investmentPdf",
    manualDeals: '/deals/draft/getAllDealsDrafts',
    manualDealById: '/deals/draft/getDraftDealById',
    updateIntrest: '/deals/draft/updateDraftPayment',
    manualDashboard: '/deals/getDraftDashboardSummary',



};






