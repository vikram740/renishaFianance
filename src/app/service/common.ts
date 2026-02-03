import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment, renishaFinance } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Common {
  http = inject(HttpClient);

  // createAgent(body:any){
  //   return this.http.post(environment.baseUrl + renishaFinance.createAgent,body)
  // }
  getAllAgent(page: number, limit: number){
    return this.http.get(environment.baseUrl+renishaFinance.getAllAgents + '?page=' + page + '&limit=' + limit)
  }
  getSingleAgent(id:any){
    return this.http.get(environment.baseUrl+renishaFinance.getSingleAgent +'/'+id)
  }
  editAgent(body:any){
      return this.http.put(environment.baseUrl+renishaFinance.editAgent,body)
  }
  deleteAgent(id:any){
    return this.http.delete(environment.baseUrl+renishaFinance.deleteAgent +'/'+id)
  }
  searchAgent(searchString: string, page: number, limit: number) {
  const body = { searchString };
  const params = {
    page: page.toString(),
    limit: limit.toString(),
  };

  return this.http.post( environment.baseUrl + renishaFinance.searchAgent,body, { params });
}

  createMember(body: any) {
    return this.http.post(environment.baseUrl + renishaFinance.createMember, body);
  }
  getAllMembers(page: number, limit: number) {
    return this.http.get(
      environment.baseUrl + renishaFinance.getAllMembers + '?page=' + page + '&limit=' + limit,
    );
  }
  getAllMember() {
    return this.http.get(environment.baseUrl + renishaFinance.getAllMembers);
  }
  getsingleMember(id: any) {
    return this.http.get(environment.baseUrl + renishaFinance.getsingleMember + '/' + id);
  }
  editMember(body: any) {
    return this.http.put(environment.baseUrl + renishaFinance.editMember, body);
  }
  deletemember(id: any) {
    return this.http.delete(environment.baseUrl + renishaFinance.deletemember + '/' + id);
  }
  searchMember(searchString: string, page: number, limit: number) {
    const body = { searchString };
    const params = { page: page.toString(), limit: limit.toString() };
    return this.http.post(`${environment.baseUrl}/member/searchMember`, body, { params });
  }

  // }
  // createNominee(body:any){
  //    return this.http.post(environment.baseUrl + renishaFinance.createMember,body)

  // }
  getAllNominees(){
     return this.http.get(environment.baseUrl+renishaFinance.getAllNominees)
  }
  getSingleNominee(id:any){
     return this.http.get(environment.baseUrl+renishaFinance.getSingleNominee + '/' + id )
  }

  // editNominee(body:any, id:any){
  //    return this.http.put(environment.baseUrl+renishaFinance.editNominee + '/' + id, body)
  // }
  // deleteNominee(id:any){
  //   return this.http.delete(environment.baseUrl + renishaFinance.deleteNominee + '/' +id)
  // }

  


  createCollectionAgent(body: any) {
    return this.http.post(environment.baseUrl + renishaFinance.createCollectionAgent, body);
  }
  getAllAgents() {
    return this.http.get(environment.baseUrl + renishaFinance.getAllAgents);
  }

  createReferralAgent(body: any) {
    return this.http.post(environment.baseUrl + renishaFinance.createReferralAgent, body);
  }

  createDeal(body: any) {
    return this.http.post(environment.baseUrl + renishaFinance.createDeal, body);
  }
  getDeals(page: number, limit: number) {
    return this.http.get(
      environment.baseUrl + renishaFinance.getAllDeals + '?page=' + page + '&limit=' + limit,
    );
  }
  getDeal(){
      return this.http.get( environment.baseUrl + renishaFinance.getAllDeals); }

  deleteDeal(id: any) {
    return this.http.delete(environment.baseUrl + renishaFinance.deleteDeal + '/' + id);
  }

  getSingleDeal(id: string) {
    return this.http.get(environment.baseUrl + renishaFinance.getSingleDealById + '/' + id);
  }
  createQr(file: File) {
    const formData = new FormData();
    formData.append('qrCodeFile', file);
    return this.http.post(environment.baseUrl + renishaFinance.createQrCode, formData);
  }
  getAllQr(){
     return this.http.get(environment.baseUrl + renishaFinance.getAllQr);

  }
  getReferralById(id: string) {
    return this.http.get(environment.baseUrl + renishaFinance.getReferralById + '/' + id);
  }
  getAgentById(id: string) {
    return this.http.get(environment.baseUrl + renishaFinance.getSingleAgent + '/' + id);
  }
  setPrimary(id:string,){
    return this.http.put(environment.baseUrl + renishaFinance.setPrimary +'/'+ id,{_id: id,isPrimary: true});

  }
  createDealCollection(body:any){
    return this.http.post(environment.baseUrl + renishaFinance.createDealCollection, body);

  }
  
  getDealCollections() {
    return this.http.get(environment.baseUrl + renishaFinance.getDealCollection );
  }

  getDealCollection(page: number, limit: number) {
    return this.http.get(environment.baseUrl + renishaFinance.getDealCollection  + '?page=' + page + '&limit=' + limit);
  }

  getDealInsallment(id:string){
     return this.http.get(environment.baseUrl + renishaFinance.getDealInsallment + '/' +id );

  }
 deleteCollection(id: string) {
  return this.http.delete(
    environment.baseUrl + renishaFinance.deleteDealCollection + '/' + id
  );
}
userById(id:string){
    return this.http.get(environment.baseUrl + renishaFinance.userDetailsById +'/'+id)

  }
}
