import { Injectable } from '@angular/core';
import { UtilsService } from './utils.service';
import { AuthenticationService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { CrxTicket, CrxTicketArticle } from '../models/data-model';
import { CrxTicketStatus, ServerResponse } from '../models/server-models';

@Injectable({
  providedIn: 'root'
})
export class CrxticketService {

  baseUrl: string = ""
  constructor(
    private utils: UtilsService,
    private http: HttpClient,
    private authService: AuthenticationService) {
    this.baseUrl = this.utils.hostName() + '/crxTickets';
  }

  addTicket(ticket: CrxTicket){
    return this.http.post<ServerResponse>(this.baseUrl, ticket, { headers: this.authService.headers });
  }

  closeTicket(ticketId: number){
    let url = this.baseUrl + `/${ticketId}`;
    return this.http.delete<ServerResponse>(url, { headers: this.authService.headers });
  }
  
  deleteTicket(ticketId: number){
    let url = this.baseUrl + `/${ticketId}/delete`;
    return this.http.delete<ServerResponse>(url, { headers: this.authService.headers });
  }

  getArticles(ticketId: number){
    let url = this.baseUrl + `/${ticketId}`;
    return this.http.get<CrxTicketArticle[]>(url, { headers: this.authService.headers });
  }

  getMyTickets(status: string){
    let url = this.baseUrl + `/created/${status}`;
    return this.http.get<CrxTicket[]>(url, { headers: this.authService.headers });
  }

  getTicketsForMe(status: string){
    let url = this.baseUrl + `/my/${status}`;
    return this.http.get<CrxTicket[]>(url, { headers: this.authService.headers });
  }

  addArticle(ticketId: number, article: CrxTicketArticle){
    let url = this.baseUrl + `/${ticketId}`;
    return this.http.post<ServerResponse>(url, article, { headers: this.authService.headers });
  }

  getStatus(){
    let url = this.baseUrl + `/status`;
    return this.http.get<CrxTicketStatus>(url, { headers: this.authService.headers });
  }

  assigneTicket(ticketId: number, userId: number){
    let url = this.baseUrl + `/${ticketId}/${userId}`;
    return this.http.put<ServerResponse>(url, null, { headers: this.authService.headers});
  }
}
