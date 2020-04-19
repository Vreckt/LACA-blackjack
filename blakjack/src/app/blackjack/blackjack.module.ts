
import { NgModule } from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { BlackjackComponent } from './blackjack/blackjack.component';
import {BlackJackRoutingModule} from './blackjack-routing.module';


import {MatListModule} from '@angular/material/list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatInputModule} from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { LobbyComponent } from './lobby/lobby.component';
import { RulesComponent } from './rules/rules.component';
import { CommonModule } from '@angular/common';

const materials = [
  MatListModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatDividerModule,
  MatInputModule,
  FormsModule
];

@NgModule({
  declarations: [
    BlackjackComponent,
    LobbyComponent,
    RulesComponent
  ],
  imports: [
    CommonModule,
    BlackJackRoutingModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    materials
  ],
  providers: [],
  bootstrap: []
})
export class BlackJackModule { }
