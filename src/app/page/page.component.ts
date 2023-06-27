import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { formatNumber } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {

  public submitted = false
  public page = 0
  public filingType = [
    {
      name: "Ordinary Filing",
      value: 0
    },
    {
      name: "Additional Filing",
      value: 1
    },
  ]

  public saveMonth: any = []
  public selectedMonth = [
    {
      name: "January",
      value: 1
    },
    {
      name: "February",
      value: 2
    },
    {
      name: "March",
      value: 3
    },
    {
      name: "April",
      value: 4
    },
    {
      name: "May",
      value: 5
    },
    {
      name: "June",
      value: 6
    },
    {
      name: "July",
      value: 7
    },
    {
      name: "August",
      value: 8
    },
    {
      name: "September",
      value: 9
    },
    {
      name: "October",
      value: 10
    },
    {
      name: "November",
      value: 11
    },
    {
      name: "December",
      value: 12
    },
  ]

  public form: any = {
    filingType: 0,
    month: "",
    year: "",
    saleAmount: "",
    taxAmount: "",
    surcharge: "",
    penalty: "200 THB",
    totalAmount: ""
  }

  public taxData: any = {}

  texType = "Vat Month"
  currentDate = new Date();
  currentYear = ["2020"]

  constructor
    (
      public _snackBar: MatSnackBar,
      public dialog: MatDialog,
    ) {
    for (let i = 2020; i < this.currentDate.getFullYear(); i++) {
      this.currentYear.push(String(i + 1))
    }
  }

  ngOnInit(): void {

  }

  changeType() {
    if (this.form.filingType == 0) {
      this.texType = "VAT Month"
    }
    else {
      this.texType = "Tax Month"
    }
  }

  changeDate() {
    this.saveMonth = []
    if (this.form.year == this.currentDate.getFullYear()) {
      for (let i = 0; i < this.currentDate.getMonth() + 1; i++) {
        this.saveMonth.push(this.selectedMonth[i])
      }
    }
    else {
      this.saveMonth = this.selectedMonth
    }
  }

  focusFunction(number: any, type: any) {
    if (number && type == 1) {
      this.form.saleAmount = number.replace(',', '').replace('THB', '')
    }
    if (number && type == 2) {
      this.form.taxAmount = number.replace(',', '').replace('THB', '')
    }
  }

  focusOutFunction(number: any, type: any) {
    if (isNaN(+number) && type == 1) {
      this.form.saleAmount = ""
      this._snackBar.open("Can only tpye Number", "", {
        duration: 3000, panelClass: "error",
      });
      return
    }

    if (type == 1) {
      if (number) {
        this.form.saleAmount = formatNumber(Number(number), 'en-US', '1.2-2') + " THB"
        this.form.taxAmount = formatNumber(Number(number * 0.07), 'en-US', '1.2-2') + " THB"
        this.form.surcharge = formatNumber(Number((number * 0.07) * 0.1), 'en-US', '1.2-2') + " THB"
        this.form.totalAmount = formatNumber(Number((number * 0.07) + ((number * 0.07) * 0.1)) + 200, 'en-US', '1.2-2') + " THB"
      }
      if (!number) {
        this.form.saleAmount = ''
        this.form.taxAmount = ''
        this.form.surcharge = ''
        this.form.totalAmount = ''
      }
    }


    if (type == 2) {
      if (number) {
        this.form.taxAmount = formatNumber(Number(number), 'en-US', '1.2-2') + " THB"
        if (Number(this.form.taxAmount.replace(',', '').replace('THB', '')) > (Number(this.form.saleAmount.replace(',', '').replace('THB', '')) * 0.07) - 21 && Number(this.form.taxAmount.replace(',', '').replace('THB', '')) < (Number(this.form.saleAmount.replace(',', '').replace('THB', '')) * 0.07) + 20) {
          console.log(this.form.taxAmount.replace(',', '').replace('THB', '') * 0.1);
          console.log(Number(this.form.taxAmount.replace(',', '').replace('THB', '')));
          this.form.surcharge = formatNumber(Number(this.form.taxAmount.replace(',', '').replace('THB', '') * 0.1), 'en-US', '1.2-2') + " THB"
          this.form.totalAmount = formatNumber(Number(200 + (this.form.taxAmount.replace(',', '').replace('THB', '') * 0.1) + (Number(this.form.taxAmount.replace(',', '').replace('THB', '')))), 'en-US', '1.2-2') + " THB"
        }
        else {
          this._snackBar.open("Invalid Tax", "", {
            duration: 3000, panelClass: "error",
          });
          this.form.taxAmount = ""
          this.form.surcharge = ""
          this.form.totalAmount = ""
        }
      }
      if (!number) {
        this.form.taxAmount = ''
        this.form.surcharge = ''
        this.form.totalAmount = ''
      }
    }

  }

  submit(stepper: MatStepper) {
    console.log(this.form);
    this.submitted = true
    if (this.form.month == '' || this.form.year == '' || this.form.saleAmount == "" || this.form.taxAmount == "") {
      this._snackBar.open("Invalid Data", "", {
        duration: 3000, panelClass: "error",
      });
      return
    }
    if (this.form.filingType == 1) {
      if (this.form.taxAmount == '' || this.form.surcharge == '' || this.form.totalAmount == "") {
        this._snackBar.open("Invalid Data", "", {
          duration: 3000, panelClass: "error",
        });
        return
      }
    }
    this.getTaxData()
    stepper.next();
    this.page = 1
  }

  back(stepper: MatStepper) {
    stepper.previous();
    this.page = 0
  }

  confirm() {
    this.taxData = {}
    this.getTaxData()
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: JSON.stringify(this.taxData)
      }
    })
  }

  getTaxData() {
    if (this.form.filingType == 0) {
      this.taxData.filingType = this.filingType[this.form.filingType].name
      this.taxData.month = this.selectedMonth[Number(this.form.month) - 1].name
      this.taxData.year = this.form.year
      this.taxData.saleAmount = Number(this.form.saleAmount.replace(',', '').replace('THB', ''))
      this.taxData.taxAmount = Number(this.form.taxAmount.replace(',', '').replace('THB', ''))
    }
    else {
      this.taxData.filingType = this.filingType[this.form.filingType].name
      this.taxData.month = this.selectedMonth[Number(this.form.month) - 1].name
      this.taxData.year = this.form.year
      this.taxData.saleAmount = Number(this.form.saleAmount.replace(',', '').replace('THB', ''))
      this.taxData.taxAmount = Number(this.form.taxAmount.replace(',', '').replace('THB', ''))
      this.taxData.surcharge = Number(this.form.surcharge.replace(',', '').replace('THB', ''))
      this.taxData.penalty = 200
      this.taxData.totalAmount = Number(this.form.totalAmount.replace(',', '').replace('THB', ''))
    }

  }

}
