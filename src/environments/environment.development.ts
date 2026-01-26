import { get } from "http";

export const environment = {
    production: false,
    // baseUrl: 'http://192.168.1.11:3000/api',
    baseUrl: 'http://localhost:3000/api',
    uploadUrl:'http://localhost:3000/'
};

export const renishaFinance = {
    login: '/user/login',
    signup: '/user/signup',
    getAllAgents:'/agent/getAgents',
    getSingleAgent:'/agent/getAgentById',
    editAgent:'/agent/editAgent',
    deleteAgent:'/agent/deleteAgent',
    createMember:'/member/createMember',
    getAllMembers:'/member/getMembers',
    getsingleMember: '/member/getMemberById',
    editMember:'/member/editMember',
    deletemember:'/member/deleteMember',
    searchMember:'/member/searchMember',
    createNominee:'/member/createMember',
    getAllNominees:'/nominee/getNominees',
    getSingleNominee:'/nominee/getNomineeById',
    editNominee:'/nominee/editNominee',
    deleteNominee:'/nominee/deleteNominee',
    Collection:'/collection/createCollection',
    getAllCollections:'/collection/getcollections',
    createCollectionAgent:'/agent/createAgent',
    createReferralAgent:'/referral/createReferral',
    getReferralById:"/referral/getReferralById",
    createDeal:'/deals/createDeals',
    getAllDeals:'/deals/getDeals',
    getSingleDealById :'/deals/getSingleDealById',
    createQrCode:'/qrcodes/createQrCodes',
    getAllQr:'/qrcodes/getAllQrCodes',
    setPrimary:'/qrcodes/UpdateQrCodePrimary',
    createDealCollection:'/dealsCollection/createDealsCollection',
    getDealCollection:'/dealsCollection/getDealsCollectionList',
    userList:'/user/usersList',
    updateUser:'/user/updateUser',
    deleteUser:'/user/deleteUserById',
    userDetailsById:'/user/userDetailsById',
    uploads:'uploads',


};






