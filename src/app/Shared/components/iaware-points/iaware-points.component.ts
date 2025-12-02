import { Component, Input } from '@angular/core';
import { IPointsModel } from 'src/app/modules/dashboards/models/IPointsModel';

@Component({
  selector: 'app-iaware-points',
  templateUrl: './iaware-points.component.html',
  styleUrl: './iaware-points.component.scss'
})
export class IawarePointsComponent {
  @Input() showInCard? : boolean = true
  @Input() points! : IPointsModel;
}