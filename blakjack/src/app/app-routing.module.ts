import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'blackjack',
    loadChildren: () => import('./blackjack/blackjack.module').then(m => m.BlackJackModule)
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
