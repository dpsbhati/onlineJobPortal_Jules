import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { TablerIconsModule } from 'angular-tabler-icons';
import {
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
  ApexPlotOptions,
  ApexFill,
  ApexMarkers,
  ApexResponsive,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MaterialModule } from 'src/app/material.module';
import { ApexNonAxisChartSeries } from 'ng-apexcharts';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/core/helpers/helper.service';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';

export interface salesChart {
  series: ApexAxisChartSeries | any;
  chart: ApexChart | any;
  dataLabels: ApexDataLabels | any;
  plotOptions: ApexPlotOptions | any;
  responsive: ApexResponsive[] | any;
  yaxis: ApexYAxis | any;
  xaxis: ApexXAxis | any;
  fill: ApexFill | any;
  tooltip: ApexTooltip | any;
  stroke: ApexStroke | any;
  legend: ApexLegend | any;
  grid: ApexGrid | any;
  colors: string[] | any;
  marker: ApexMarkers | any;
}
interface productcard {
  id: number;
  color: string;
  title: string;
  value: number;
  subtitle: string;
}
export interface ourvisitorChart {
  series: ApexNonAxisChartSeries | any;
  chart: ApexChart | any;
  responsive: ApexResponsive[] | any;
  labels: any;
  tooltip: ApexTooltip | any;
  legend: ApexLegend | any;
  colors: string[] | any;
  stroke: any;
  dataLabels: ApexDataLabels | any;
  plotOptions: ApexPlotOptions | any;
}
@Component({
  selector: 'app-starter',
  templateUrl: './starter.component.html',
  imports: [
    MaterialModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    NgApexchartsModule,
    TablerIconsModule,
    MatInputModule,
  ],
  styleUrls: ['./starter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  @ViewChild('chart2') chart2: ChartComponent = Object.create(null);
  public salesChart!: Partial<salesChart> | any;
  public ourvisitorChart!: Partial<ourvisitorChart> | any;
  joboverviewlist:any;
    total: number = 0;
     isLoading: boolean = false;
  pageConfig: any = {
    curPage: 1,
    perPage: 10,
    sortBy: 'created_at',
    direction: 'desc',
    whereClause: [],
  };
  productcard: productcard[] = [
    // {
    //   id: 1,
    //   color: 'mat-primary',
    //   title: '25',
    //   subtitle: 'Total Open Jobs',
    //   value: 25,
    // },
    // {
    //   id: 2,
    //   color: 'mat-secondary',
    //   title: '05',
    //   subtitle: 'Jobs Applied',
    //   value: 5,
    // },
    // {
    //   id: 3,
    //   color: 'mat-success',
    //   title: '02',
    //   subtitle: 'Applications in Review',
    //   value: 2,
    // },
    // {
    //   id: 4,
    //   color: 'mat-warn',
    //   title: '01',
    //   subtitle: 'Offers Received',
    //   value: 1,
    // },
  ];

  constructor(
     private adminService: AdminService,
        private router: Router,
        private helperService: HelperService,
        private authService: AuthService,
        private loader: LoaderService,
        private toastr: ToastrService,
        private dialog: MatDialog
  ) {
    // Sales Chart for Job Applicants
    this.salesChart = {
      series: [
        {
          name: 'Applied',
          data: [20, 35, 25, 40, 30, 50, 45], // Job applications per day
          color: 'var(--mat-sys-primary)',
        },
        {
          name: 'Shortlisted',
          data: [10, 20, 15, 25, 20, 30, 28], // Shortlisted candidates
          color: 'var(--mat-sys-secondary)',
        },
      ],
      chart: {
        fontFamily: 'inherit',
        type: 'bar',
        height: 330,
        foreColor: '#adb0bb',
        offsetY: 10,
        offsetX: -15,
        toolbar: {
          show: false,
        },
      },
      grid: {
        show: true,
        strokeDashArray: 3,
        borderColor: 'rgba(0,0,0,.1)',
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '30%',
          endingShape: 'flat',
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 5,
        colors: ['transparent'],
      },
      xaxis: {
        type: 'category',
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: '#a1aab2',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#a1aab2',
          },
        },
      },
      fill: {
        opacity: 1,
        colors: ['#1B84FF', '#43CED7'],
      },
      tooltip: {
        theme: 'dark',
      },
      legend: {
        show: false,
      },
      responsive: [
        {
          breakpoint: 767,
          options: {
            stroke: {
              show: false,
              width: 5,
              colors: ['transparent'],
            },
          },
        },
      ],
    };

    // Our Visitor Chart for Applicant Source
    this.ourvisitorChart = {
      series: [60, 25, 10, 5], // Source percentage
      labels: ['LinkedIn', 'Indeed', 'Website', 'Referral'],
      chart: {
        type: 'donut',
        height: 245,
        fontFamily: 'inherit',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 0,
      },
      plotOptions: {
        pie: {
          expandOnClick: true,
          donut: {
            size: '83',
            labels: {
              show: true,
              name: {
                show: true,
                offsetY: 7,
              },
              value: {
                show: false,
              },
              total: {
                show: true,
                color: '#a1aab2',
                fontSize: '13px',
                label: 'Applicants Source',
              },
            },
          },
        },
      },
      colors: [
        'var(--mat-sys-primary)',
        'var(--mat-sys-secondary)',
        '#eceff180',
        '#725AF2',
      ],
      tooltip: {
        show: true,
        fillSeriesColor: false,
      },
      legend: {
        show: false,
      },
      responsive: [
        {
          breakpoint: 1025,
          options: {
            chart: {
              height: 270,
            },
          },
        },
        {
          breakpoint: 426,
          options: {
            chart: {
              height: 250,
            },
          },
        },
      ],
    };
  }
  ngOnInit(): void {
    // this.isLoading = true;
    this.onPagination();
  }

   onPagination(): void {
    this.isLoading = true;
    this.adminService.jobOverview(this.pageConfig).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res.statusCode === 200 && res.data) {
          const data = res.data;

          // Assign job overview list and total count
          this.joboverviewlist = data.Job_Application_Overview || [];
          this.total = res.count || 0;

          // Dynamically create product cards from API response
          this.productcard = [
            {
              id: 1,
              color: 'mat-primary',
              title: data.Total_Open_Jobs?.toString() || '0',
              subtitle: 'Total Open Jobs',
              value: data.Total_Open_Jobs || 0,
            },
            {
              id: 2,
              color: 'mat-secondary',
              title: data.Jobs_Applied?.toString() || '0',
              subtitle: 'Jobs Applied',
              value: data.Jobs_Applied || 0,
            },
            {
              id: 3,
              color: 'mat-success',
              title: data.Applications_in_Review_Pending?.toString() || '0',
              subtitle: 'Applications in Review',
              value: data.Applications_in_Review_Pending || 0,
            },
            {
              id: 4,
              color: 'mat-warn',
              title:
                (data.Job_Application_Overview &&
                  data.Job_Application_Overview[0]?.Offers_Received_Shortlisted
                    ?.toString()) ||
                '0',
              subtitle: 'Offers Received',
              value:
                data.Job_Application_Overview &&
                data.Job_Application_Overview[0]?.Offers_Received_Shortlisted
                  ? data.Job_Application_Overview[0].Offers_Received_Shortlisted
                  : 0,
            },
          ];
        } else {
          // Reset data if no valid response
          this.joboverviewlist = [];
          this.total = 0;
          this.productcard = [];
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toastr.error(err?.error?.message || 'Something went wrong');
        this.joboverviewlist = [];
        this.total = 0;
        this.productcard = [];
      },
    });
  }
}
