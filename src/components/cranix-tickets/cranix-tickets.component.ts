import { Component } from '@angular/core';
import { GenericObjectService } from '../../services/generic-object.service';
import { CrxTicket, CrxTicketArticle } from '../models/data-model';
import { CrxticketService } from '../../services/crxticket.service';
import { AuthenticationService } from '../../services/auth.service';

@Component({
  selector: 'app-cranix-tickets',
  templateUrl: './cranix-tickets.component.html',
  styleUrl: './cranix-tickets.component.css'
})
export class CranixTicketsComponent {


  selectedTicket: CrxTicket
  tickets: CrxTicket[] = []
  articles: CrxTicketArticle[] = []
  manager: boolean = false;
  worker: boolean = false;
  requestedStatus: string = "NRW"

  constructor(
    public objectService: GenericObjectService,
    private authService: AuthenticationService,
    private ticketService: CrxticketService
  ){
    this.manager = this.authService.isAllowed('crxticket.manager')
    this.worker = this.authService.isAllowed('crxticket.worker')
  }

  public loadData(){
    if(this.manager || this.worker) {
      this.ticketService.getTicketsForMe(this.requestedStatus).subscribe(
        (val) => {
          this.tickets = val
        }
      )
    }else {
      this.ticketService.getMyTickets(this.requestedStatus).subscribe(
        (val) => {
          this.tickets = val
        }
      )
    }
  }
  public addTicket(){
    this.ticketService.addTicket(this.selectedTicket).subscribe(
      (val) => {
        this.objectService.responseMessage(val)
      }
    )
  }
  public openAddTicket(){
    this.selectedTicket = new CrxTicket()
  }

  public closeTicket(){
    this.ticketService.closeTicket(this.selectedTicket.id).subscribe(
      (val) => {
        delete this.selectedTicket;
        this.objectService.responseMessage(val)
      }
    )
  }
  public closeTicketModal(){
    delete this.selectedTicket;
  }

  public selectTicket(ticket: CrxTicket){
    this.ticketService.getArticles(ticket.id).subscribe(
      (val) => {
        this.articles = val
        this.selectedTicket = ticket
      }
    )
  }
}
