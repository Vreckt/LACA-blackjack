
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
import { RulesComponent, DialogRulesComponent } from './rules/rules.component';
import { CommonModule } from '@angular/common';
import {MatDialogModule} from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import { TableComponent } from './lobby/dialogTable/table.component';
import { MatTableModule } from '@angular/material/table';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSelectModule} from '@angular/material/select';

const materials = [
  MatListModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatDividerModule,
  MatInputModule,
  FormsModule,
  MatDialogModule,
  MatMenuModule,
  MatTableModule,
  MatGridListModule,
  MatSelectModule
];

@NgModule({
  declarations: [
    BlackjackComponent,
    LobbyComponent,
    RulesComponent,
    DialogRulesComponent,
    TableComponent
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
