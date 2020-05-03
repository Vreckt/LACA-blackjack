import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlackjackComponent } from './blackjack/blackjack.component';
import { RulesComponent } from './rules/rules.component';
import { LobbyComponent } from './lobby/lobby.component';


const routes: Routes = [
  {path: '', component: BlackjackComponent,
    // children: [
    //   {path: ':id', component: LobbyComponent}
    // ]
  },
  {path: ':id', component: LobbyComponent},
  {path: 'rules', component: RulesComponent},
  {path: '**', component: BlackjackComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlackJackRoutingModule { }
