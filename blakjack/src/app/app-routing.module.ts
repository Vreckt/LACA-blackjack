import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectionComponent } from './connection/connection.component';


const routes: Routes = [
  {
    path: 'blackjack',
    loadChildren: () => import('./modules/blackjack/blackjack.module').then(m => m.BlackJackModule)
  },
  {
    path: 'connection',
    component: ConnectionComponent
  },
  {
    path: '',
    redirectTo: 'blackjack',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
