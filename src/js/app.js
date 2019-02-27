// import "bootstrap/dist/css/bootstrap.css";
import "../css/style.scss";

import { branches } from "./branches.js";
import _ from "lodash";
import clock from "../img/icon_clock.png";
import info from "../img/icon_info.png";
import locationIc from "../img/icon_location.png";
import phone from "../img/icon_phone.png";
import m1 from "../img/m1.png";
import marker from "../img/custom_marker.png";
import markerGreen from "../img/custom_marker_green.png";
import miniLogo from "../img/mfinanse-minilogo.jpg";

var map;
var locationsToDisplay = [];
//form validation
function validateForm(form) {
  var fields = form.querySelectorAll("[required]");
  var errors = [];
  var formValid = validate(errors);
  function validate(errors) {
    //IE support
    for (var i = 0; i < fields.length; i++) {
      validateField(fields[i], errors);
    }
    return !errors.length;
  }
  function validateField(field, errors) {
    var fieldValid = field.validity.valid;
    if (fieldValid) {
      field.nextSibling.nextSibling.innerHTML = "";
      field.classList.remove("invalid");
    } else {
      field.nextSibling.nextSibling.innerHTML = field.dataset.errorMessage;
      field.classList.add("invalid");
      errors.push("error");
    }
  }
  if (formValid) {
    return true;
  } else {
    return false;
  }
}

//download PDF
$(".row-headBar__btn-pdf").click(function() {
  //widok listy nr1
  if ($("#btn-toggle-view").attr("data-active") === "true") {
    var divToPrint = document.getElementById("accordionExample");
    var test = [].map.call(divToPrint.children, function(element) {
      var rodzaj = element.querySelector(".infoBox__rodzaj b")
          ? element.querySelector(".infoBox__rodzaj b").textContent + "\n"
          : "",
        adres = element.querySelector(".infoBox__adres span")
          ? element.querySelector(".infoBox__adres span").textContent + "\n"
          : "",
        otwarcie = element.querySelector(".infoBox__otwarcie span")
          ? element.querySelector(".infoBox__otwarcie span").textContent + "\n"
          : "",
        tel_fax = element.querySelector(".infoBox__tel_fax span")
          ? element.querySelector(".infoBox__tel_fax span").textContent + "\n"
          : "",
        zakres = element.querySelector(".infoBox__zakres span")
          ? element.querySelector(".infoBox__zakres span").lastChild.lastChild
              .textContent + "\n"
          : "";

      return {
        unbreakable: true,
        layout: "lightHorizontalLines",
        margin: [5, 2, 10, 20],
        table: {
          widths: [100, 380, "auto", "auto"],
          body: [
            [
              { text: "Rodzaj", bold: true },
              { text: rodzaj, color: "red", bold: true }
            ],
            [{ text: "Adres", bold: true }, adres],
            [{ text: "godziny otwarcia", bold: true }, otwarcie],
            [{ text: "tel/fax", bold: true }, tel_fax],
            [{ text: "Zakres usług", bold: true }, zakres]
          ]
        }
      };
    });
    //widok listy nr2
  } else {
    var divToPrint = document.getElementById("datafetch");

    var test = [].map.call(divToPrint.children, function(element) {
      var nazwa = element.querySelector(".infoBox__nazwa b")
          ? element.querySelector(".infoBox__nazwa b").textContent + "\n"
          : "",
        adres = element.querySelector(".infoBox__adres span")
          ? element.querySelector(".infoBox__adres span").textContent + "\n"
          : "",
        otwarcie = element.querySelector(".infoBox__otwarcie span")
          ? element.querySelector(".infoBox__otwarcie span").textContent + "\n"
          : "",
        tel_fax = element.querySelector(".infoBox__tel_fax span")
          ? element.querySelector(".infoBox__tel_fax span").textContent + "\n"
          : "",
        zakres = element.querySelector(".infoBox__zakres b span")
          ? element.querySelector(".infoBox__zakres b span").textContent + "\n"
          : "";
      return {
        unbreakable: true,
        layout: "lightHorizontalLines",
        margin: [5, 2, 10, 20],
        table: {
          widths: [100, 380, "auto", "auto"],
          body: [
            [
              { text: "Rodzaj", bold: true },
              { text: nazwa, color: "red", bold: true }
            ],
            [{ text: "Adres", bold: true }, adres],
            [{ text: "godziny otwarcia", bold: true }, otwarcie],
            [{ text: "tel/fax", bold: true }, tel_fax],
            [{ text: "Zakres usług", bold: true }, zakres]
          ]
        }
      };
    });
  }
  var docDefinition = {
    content: [
      {
        columns: [
          {
            image:
              "data:image/jpeg;base64,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BAAAAB44QklNBBkAAAAAAAQAAAAeOEJJTQPzAAAAAAAJAAAAAAAAAAABADhCSU0nEAAAAAAACgABAAAAAAAAAAE4QklNA/UAAAAAAEgAL2ZmAAEAbGZmAAYAAAAAAAEAL2ZmAAEAoZmaAAYAAAAAAAEAMgAAAAEAWgAAAAYAAAAAAAEANQAAAAEALQAAAAYAAAAAAAE4QklNA/gAAAAAAHAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAOEJJTQQIAAAAAAAQAAAAAQAAAkAAAAJAAAAAADhCSU0EHgAAAAAABAAAAAA4QklNBBoAAAAABeAAAAAGAAAAAAAAAAAAAAAqAAAAMAAAAA0AbQBmAGkAbgBhAG4AcwBlAC0AbABvAGcAbwAAAAIAAAAFAAAAAwAAAAIAAAAAAAAAAQAAAAAAAAAAAAAAMAAAACoAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAMAAAACoAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAQAAAAAAAG51bGwAAAACAAAABmJvdW5kc09iamMAAAABAAAAAAAAUmN0MQAAAAQAAAAAVG9wIGxvbmcAAAAAAAAAAExlZnRsb25nAAAAAAAAAABCdG9tbG9uZwAAACoAAAAAUmdodGxvbmcAAAAwAAAABnNsaWNlc1ZsTHMAAAACT2JqYwAAAAEAAAAAAAVzbGljZQAAABIAAAAHc2xpY2VJRGxvbmcAAAAFAAAAB2dyb3VwSURsb25nAAAAAwAAAAZvcmlnaW5lbnVtAAAADEVTbGljZU9yaWdpbgAAAA11c2VyR2VuZXJhdGVkAAAAAFR5cGVlbnVtAAAACkVTbGljZVR5cGUAAAAASW1nIAAAAAZib3VuZHNPYmpjAAAAAQAAAAAAAFJjdDEAAAAEAAAAAFRvcCBsb25nAAAAAAAAAABMZWZ0bG9uZwAAAAAAAAAAQnRvbWxvbmcAAAAqAAAAAFJnaHRsb25nAAAAMAAAAAN1cmxURVhUAAAAAQAAAAAAAG51bGxURVhUAAAAAQAAAAAAAE1zZ2VURVhUAAAAAQAAAAAABmFsdFRhZ1RFWFQAAAABAAAAAAAOY2VsbFRleHRJc0hUTUxib29sAQAAAAhjZWxsVGV4dFRFWFQAAAABAAAAAAAJaG9yekFsaWduZW51bQAAAA9FU2xpY2VIb3J6QWxpZ24AAAAHZGVmYXVsdAAAAAl2ZXJ0QWxpZ25lbnVtAAAAD0VTbGljZVZlcnRBbGlnbgAAAAdkZWZhdWx0AAAAC2JnQ29sb3JUeXBlZW51bQAAABFFU2xpY2VCR0NvbG9yVHlwZQAAAABOb25lAAAACXRvcE91dHNldGxvbmcAAAAAAAAACmxlZnRPdXRzZXRsb25nAAAAAAAAAAxib3R0b21PdXRzZXRsb25nAAAAAAAAAAtyaWdodE91dHNldGxvbmcAAAAAT2JqYwAAAAEAAAAAAAVzbGljZQAAABIAAAAHc2xpY2VJRGxvbmcAAAAAAAAAB2dyb3VwSURsb25nAAAAAAAAAAZvcmlnaW5lbnVtAAAADEVTbGljZU9yaWdpbgAAAA1hdXRvR2VuZXJhdGVkAAAAAFR5cGVlbnVtAAAACkVTbGljZVR5cGUAAAAASW1nIAAAAAZib3VuZHNPYmpjAAAAAQAAAAAAAFJjdDEAAAAEAAAAAFRvcCBsb25nAAAAAAAAAABMZWZ0bG9uZwAAAAAAAAAAQnRvbWxvbmcAAAAqAAAAAFJnaHRsb25nAAAAMAAAAAN1cmxURVhUAAAAAQAAAAAAAG51bGxURVhUAAAAAQAAAAAAAE1zZ2VURVhUAAAAAQAAAAAABmFsdFRhZ1RFWFQAAAABAAAAAAAOY2VsbFRleHRJc0hUTUxib29sAQAAAAhjZWxsVGV4dFRFWFQAAAABAAAAAAAJaG9yekFsaWduZW51bQAAAA9FU2xpY2VIb3J6QWxpZ24AAAAHZGVmYXVsdAAAAAl2ZXJ0QWxpZ25lbnVtAAAAD0VTbGljZVZlcnRBbGlnbgAAAAdkZWZhdWx0AAAAC2JnQ29sb3JUeXBlZW51bQAAABFFU2xpY2VCR0NvbG9yVHlwZQAAAABOb25lAAAACXRvcE91dHNldGxvbmcAAAAAAAAACmxlZnRPdXRzZXRsb25nAAAAAAAAAAxib3R0b21PdXRz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IHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmZhNjljMDJlLWI0ZWYtNDExOC1hZTVjLWJlYmQ3MzBhNTRhNCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGMkQ1MkMxOTY3Q0MxMUU4QTZBRThEMUM1QTI0NUY2QiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpmZGExMDI2NS1kMDQ5LTEwNDMtYWJlZi02NWY5YzIxZDU3MDciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0xMS0wNlQxNToxOTo1MCswMTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMTEtMDZUMTU6MjA6NDArMDE6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTgtMTEtMDZUMTU6MjA6NDArMDE6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvanBlZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjBiNWVjMjRlLWYxMjAtYzE0MS04NmQxLTc1YWZhOGM1MDQ0NiIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmVhZmU5MjkxLTZmNDAtMDA0ZS05Zjg5LWRiOTExMDcwNWY4MyIvPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpmZGExMDI2NS1kMDQ5LTEwNDMtYWJlZi02NWY5YzIxZDU3MDciIHN0RXZ0OndoZW49IjIwMTgtMTEtMDZUMTU6MjA6NDArMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0idyI/Pv/uACFBZG9iZQBkAAAAAAEDABADAgMGAAAAAAAAAAAAAAAA/9sAhAAGBAQEBQQGBQUGCQYFBgkLCAYGCAsMCgoLCgoMEAwMDAwMDBAMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMAQcHBw0MDRgQEBgUDg4OFBQODg4OFBEMDAwMDBERDAwMDAwMEQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wgARCAAqADADAREAAhEBAxEB/8QAywABAQEBAQAAAAAAAAAAAAAABwYFBAgBAAIDAQEBAAAAAAAAAAAAAAUGAwQHAgEIEAAABQIFAwMFAQAAAAAAAAABAgMEBQYHABIyMzUxEzRCNggRIxQVJhcRAAEDAgIDCQkRAAAAAAAAAAIBAwQABRESMTOzIUFRIjJSE3Q2gUJicmMUNDV1YXGRscHRorJDU3OTJBVlBkYSAAECAgMMCgMAAAAAAAAAAAIAATIDERJSMUFxImJygpKywhMzECFCoiNDY3ODRGHyNP/aAAwDAQECEQMRAAAA4VXWcjwasqFImdTdNP8AP65aLgofdLYimoS9XiGMhNVsdVbhYHDbz6DNZx3h/R0oyVEOP0FmyDht5UiKPVL/AAInmdJmxGhksg4becXkYypdAaez1XY+cGe4ak4dUzuad+u1oBmJ7cuSIM5D/9oACAECAAEFAF1jgfvqdr85fDRY4kklTlcxahjAoXMqaLNkWpdUCNY4xSSY/VxE6XG44EfwqUOIptjiKspuROlxuLOSGaU/JItitVgzSgkzROlxuBtYZ7cr5UTpV1Dow20vd5j0/9oACAEDAAEFAGDFAW86zRIQWyWCMUO33z4jDiYGZ8jSSqJNwUk2QTGqhMoKpCmaK6R3jvgD9jOlDPIIkCMlNyK6R3jycasm8lWaixnDUyrJ8skpiK6R3jVDtjgm2OIro12pXTgujDLp/9oACAEBAAEFAKuq2qkasQrKsBmf3k3ml6yrAkulVNTilZKSkX8fUjQzy4D347VY1lXdsJEjc/xumnq03ASMBI2E46tPeEe8ctrIWrOcWdEycgp8gL4h/WWE46tfeCFzqO/zSgqkiYdGIqZlBXaunUdFz5LCcdWfvFvznrmeaRH7VhOOqHn0uS9UhyJNFsfE/9oACAECAgY/ACZiKJ76mPWLqllfUczXJBST3AvqYzO4tXJFS9PWnbLfaRizt4gOGsqQMZj2Ye9+qBifGFh7qMrRVtEkWFFnFtIn9NG16kd5Uv8AlNmosKLOLaRiz4wy0bTHorVb1a0mNrhb6cfNHEJFhRZxbSm+0W70S8AKZnuiwp+Td7UWkj5MD5vyZC+kh5N6Hc3UfKi8zmaeUng+LeX/2gAIAQMCBj8Alu8uXTww7A2VLqgA+MMIiOLjKENUVTUCCyNlXS1kVL0oCsyhLVloWqEPDmDM1VQQuKqsBENFWtTVTs6JS/bDYRN6qF/wrlwJZaWKmzUSl+2GwuMTeFMnYvXayULg0K4bRcIe5jbqpGJEpfthsKV74b3RobvQSD+6AYOXD2Miyg/r5jc6HQ9Syvsr7sOj+q8lPB8a/9oACAEBAQY/AL0yzeZzbTc6SDbYSXRERF0kQRRC3ESrMC3y4KDk9oHB86ewIVxxFUzbqV6wk6fvT+epoBfbgIDIcQRGU8iIiFoRM1Aq3eaqqKY/qHeDxqupTpT0om320AnnCcUUUMcEzKuFXSGJIBSbq8yhroFXJBDivvY1Y34U2NOabntuyjRCaRpoBIlNcVLNzco86ieiy25LibvRZVDNhvCSqSfDUmU/eo0eW8ZOjEFsnEFDJVRCPMP0Qo7XcBRJDKDxgXEDFU4pgvAVXjrDWzWr8v8AIStsVW99hwge8xjj0iLxsDMRLd8VauAKSqAOhkFVxRMUXHCnTOS4SvXCcy6imSoTYi4ggqc0co5aje7CDH81yrx1hrZrV+9oStsVWv8Aq3nTn7y41HiAz0LmXpkMSUc+XJ3vKxqaE90myecBW8AIsUFFReSi05f3xJyEzc5JuZE4/RukY5kFd9EPNlqNOtT7km6YA2p5TBsWEUiVFQ0Hj4lV46w1s1q++0JW2KrH7QZ+Wu7U7rDn1loPFT4qvH47WzWrn2L9Ke9K1+sLW+V5/hVbewvpTejWb+q8rza/z2mpPYXWnrdZyu/8PnUPZDQmjR3Kn+qtaHqfkcn7XwuCv//Z\n",
            width: 34,
            height: 30
          },
          {
            text: "Placówki mBank",
            bold: true,
            fontSize: 24,
            margin: [10, 2, 10, 20]
          }
        ]
      },
      test
    ]
  };
  pdfMake.createPdf(docDefinition).open();
  pdfMake.createPdf(docDefinition).download("Placowki_mBank.pdf");
});

$("#btn-toggle-view").click(function() {
  if (locationsToDisplay.length) {
    if ($(this).attr("data-active") === "false") {
      $(this).animate(
        {
          opacity: 0
        },
        300,
        function() {
          $(this)
            .html('<i class="fa fa-th"></i>')
            .attr("data-active", "true");
          $(this).css("opacity", "1");
        }
      );
      showInDOM(locationsToDisplay, "#datafetch", "change");
    } else {
      $(this).animate(
        {
          opacity: 0
        },
        300,
        function() {
          $(this)
            .html('<i class="fa fa-th-list"></i>')
            .attr("data-active", "false");
          $(this).css("opacity", "1");
        }
      );
      showInDOM(locationsToDisplay, "#datafetch");
    }
  }
});

//arrow to hide and show form
// $(".slideForm").click(function() {
//   if ($(this).attr("data-slide") === "false") {
//     $(this)
//       .attr("data-slide", "true")
//       .css("transform", "rotateX(180deg)");
//     $(".placowki-filters__wrapper").css("transform", "translateY(205px)");
//   } else {
//     $(this)
//       .attr("data-slide", "false")
//       .css("transform", "rotateX(0deg)");
//     $(".placowki-filters__wrapper").css("transform", "translateY(0px)");
//   }
// });

document.querySelector("#form").addEventListener("submit", function(e) {
  e.preventDefault();
  if (!validateForm(this)) {
    return false;
  }
  var range = document.querySelector("#rangeField").value;
  var address =
    jQuery("#street").val() +
    ", " +
    jQuery("#city").val() +
    ", " +
    jQuery("#zipcode").val();

  changeCityToCoords(address, function(address, status) {
    if (!status) {
      locationsToDisplay = calculateDistance(address, branches, range);
    } else {
      locationsToDisplay = [];
    }
    initMapPlac(locationsToDisplay, address, "formInit");
    showInDOM(locationsToDisplay, "#datafetch");
  });
});

function showInDOM(locations, result, view, all) {
  var fieldsContainer = document.querySelector(result);
  var count = 0;
  for (let k in locations) if (locations.hasOwnProperty(k)) count++;

  $(result).animate(
    {
      opacity: 0
    },
    100,
    function() {
      var fields = document.createElement("div");
      if (!view) {
        $("#btn-toggle-view").attr("data-active", "false");
        //layout listy nr 1
        locations.map(function(element) {
          var field = document.createElement("div");
          field.className = "placowki-list__wrapper__field col-md-4 col4";
          var tooltip =
            "<div>" +
            "<b>" +
            "Zakres usług" +
            ":" +
            "<p>" +
            element.zakres +
            "</p>" +
            "</div>";

          var rodzaj = element.rodzaj ? element.rodzaj : "&nbsp";
          var godziny = element.godziny_otwarcia
            ? '<tr class="infoBox__otwarcie">' +
              '<td><img class="infoBox__icon" src="../' +
              clock +
              '" /></td>' +
              "<td><span>" +
              element.godziny_otwarcia +
              "</b></span></td>" +
              "</tr>"
            : "";
          var fax = element.fax ? " fax.: <b>" + element.fax + "</b>" : "";
          var tel =
            element.tel || element.fax
              ? '<tr class="infoBox__tel_fax"><td><img class="infoBox__icon" src="../' +
                phone +
                '" /></td><td><span>tel.: <b>' +
                element.tel +
                "</b>" +
                fax +
                "</span></td></tr>"
              : "";

          field.innerHTML =
            '<div data-id="' +
            element.id +
            '" class="infoBox" data-toggle="tooltip" data-placement="left" data-html="true" title="' +
            tooltip +
            '"><table>' +
            '<tr class="infoBox__nazwa"><td></td><td><span><b>' +
            rodzaj +
            "</b></span></td></tr>" +
            '<tr class="infoBox__adres"><td><img class="infoBox__icon" src="../' +
            locationIc +
            '" /></td><td><span><b>' +
            element.ulica +
            "</b>, " +
            element.kod_pocztowy +
            " " +
            element.miasto +
            "</span></td></tr>" +
            godziny +
            tel +
            '<tr class="infoBox__zakres"><td><img class="infoBox__icon" src="../' +
            info +
            '" /></td><td><span><b>' +
            "Zakres usług" +
            ' <span class="hide-in-DOM">' +
            element.zakres +
            "</span></b></span></td></tr>" +
            "</table></div>";
          fields.appendChild(field);
        });

        setTimeout(function() {
          fieldsContainer.innerHTML = "";
          fieldsContainer.innerHTML = fields.innerHTML;
          $('[data-toggle="tooltip"]').tooltip();
          $(result).css("opacity", "1");
          $("#itemOutputHeader").html("Lista oddziałów" + "(" + count + "):");
          if (count === 0) {
            $("#datafetch").html("<h4>Brak wyników wyszukiwania</h4>");
          }
        }, 300);
      } else {
        //layout listy nr2
        locations.map(function(element, index) {
          var field = document.createElement("div");
          field.className = "placowki-list__wrapper__field col-12 card";

          var rodzaj = element.rodzaj ? element.rodzaj : "&nbsp";
          var godziny = element.godziny_otwarcia
            ? '<tr class="infoBox__otwarcie">' +
              '<td><img class="infoBox__icon" src="../' +
              clock +
              '" /></td>' +
              "<td><span>" +
              element.godziny_otwarcia +
              "</b></span></td>" +
              "</tr>"
            : "";
          var fax = element.fax ? " fax.: <b>" + element.fax + "</b>" : "";
          var tel =
            element.tel || element.fax
              ? '<tr class="infoBox__tel_fax"><td><img class="infoBox__icon" src="../' +
                phone +
                '" /></td><td><span>tel.: <b>' +
                element.tel +
                "</b>" +
                fax +
                "</span></td></tr>"
              : "";

          field.innerHTML =
            '<div class="card-header" id="h' +
            index +
            '">' +
            '<a class="btn btn-link collapsed" data-toggle="collapse" data-target="#c' +
            index +
            '" aria-expanded="false" aria-controls="c' +
            index +
            '">' +
            '<h5><img class="infoBox__logoImg" src="../' +
            miniLogo +
            '" />' +
            element.nazwa +
            "</h5>" +
            "</a>" +
            "</div>" +
            '<div id="c' +
            index +
            '" class="collapse" aria-labelledby="h' +
            index +
            '" data-parent="#accordionExample"><div class="card-body">' +
            '<div class="infoBox"><table>' +
            '<tr class="infoBox__rodzaj"><td></td><td><span><b>' +
            rodzaj +
            "</b></span></td></tr>" +
            '<tr class="infoBox__adres"><td><img class="infoBox__icon" src="../' +
            locationIc +
            '" /></td><td><span><b>' +
            element.ulica +
            "</b>, " +
            element.kod_pocztowy +
            " " +
            element.miasto +
            "</span></td></tr>" +
            godziny +
            tel +
            '<tr class="infoBox__zakres"><td><img class="infoBox__icon" src="../' +
            info +
            '" /></td><td><span><b>' +
            "Zakres usług" +
            "<b>: </b>" +
            element.zakres +
            "</span></td></tr>" +
            "</div>" +
            "</table>" +
            "</div></div>";
          fields.appendChild(field);
        });
        setTimeout(function() {
          fieldsContainer.innerHTML = "";
          fieldsContainer.innerHTML =
            '<div class="accordion col-12" id="accordionExample">' +
            fields.innerHTML +
            "</div>";
          $(result).animate({ opacity: 1 }, 300, function() {
            $(".tooltip").css("display", "none");
          });
          $("#itemOutputHeader").html("Lista oddziałów" + "(" + count + "):");
        }, 300);
      }
    }
  );
}

function calculateDistance(startPoint, allLocation, range) {
  if (!range) {
    return allLocation;
  }
  var locationToShow = allLocation.filter(function(singleLocation) {
    var p = 0.017453292519943295;
    return (
      12742 *
        Math.asin(
          Math.sqrt(
            0.5 -
              Math.cos((startPoint.lat - singleLocation.lat) * p) / 2 +
              (Math.cos(singleLocation.lat * p) *
                Math.cos(startPoint.lat * p) *
                (1 - Math.cos((startPoint.lng - singleLocation.lng) * p))) /
                2
          )
        ) <
      range
    );
  });
  return locationToShow.length > 0 ? locationToShow : [];
}

function changeCityToCoords(address, callback) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: address }, function(results, status) {
    var obj;

    if (status === google.maps.GeocoderStatus.OK) {
      var latitude = results[0].geometry.location.lat();
      var longitude = results[0].geometry.location.lng();
      obj = {
        lat: latitude,
        lng: longitude
      };
      callback(obj);
    } else {
      $("#datafetch").html("<h4>Brak wyników wyszukiwania</h4>");
      callback({ lat: 51.919437, lng: 19.145136 }, "ZERO_RESULTS");
    }
  });
}

function initMapPlac(locationsArray, location, controller) {
  if (!locationsArray) locationsArray = branches;
  if (!location) location = { lat: 51.919437, lng: 19.145136 };
  if (!controller) controller = "autoInit";

  $("#datafetch").html('<div class="lds-dual-ring"></div>');

  controller === "autoInit" ? (locationsToDisplay = locationsArray) : "";

  map = new google.maps.Map(document.getElementById("map"), {
    center: location
      ? { lat: location.lat, lng: location.lng }
      : { lat: 51.919437, lng: 19.145136 },
    zoom: 6
  });

  map.addListener("mousemove", function() {
    $(".placowki-filters__wrapper").css("transform", "translateY(280px)");
  });
  map.addListener("mouseout", function() {
    $(".placowki-filters__wrapper").css("transform", "translateY(0px)");
  });

  var markersTest = [];
  var infoWindow = null;
  function markersMaker(locationsArray) {
    locationsArray.map(function(singleLocation, index) {
      markersTest.push(
        new google.maps.Marker({
          position: new google.maps.LatLng(
            singleLocation.lat,
            singleLocation.lng
          ),
          map: map,
          visible: false,
          icon: "../" + marker,
          id: singleLocation.id
        })
      );
      google.maps.event.addListener(map, "click", function() {
        infoWindow ? infoWindow.close() : "";
        //IE support
        for (var i = 0; i < markersTest.length; i++) {
          markersTest[i].setIcon("../" + marker);
        }
      });
      google.maps.event.addListener(markersTest[index], "click", function() {
        infoWindow ? infoWindow.close() : "";
        //IE support
        for (var i = 0; i < markersTest.length; i++) {
          infoWindow = new google.maps.InfoWindow(/*{pixelOffset: new google.maps.Size(200,0)}*/);
          markersTest[i].setIcon("../" + marker);
        }
        this.setIcon("../" + markerGreen);

        var otwarcie = singleLocation.godziny_otwarcia
          ? '<tr class="infoBox__otwarcie"><td><img class="infoBox__icon" src="../' +
            clock +
            '" /></td><td><span>' +
            singleLocation.godziny_otwarcia +
            "</b></span></td></tr>"
          : "";
        var tel = singleLocation.tel
          ? "tel.: <b>" + singleLocation.tel + "</b>"
          : "";
        var fax = singleLocation.fax
          ? " fax.: <b>" + singleLocation.fax + "</b>"
          : "";
        var tel_fax =
          singleLocation.tel || singleLocation.fax
            ? '<tr class="infoBox__tel_fax"><td><img class="infoBox__icon" src="../' +
              phone +
              '" /></td><td><span>' +
              tel +
              fax +
              "</span></td></tr>"
            : "";

        infoWindow.setContent(
          '<table class="infoBox">' +
            '<tr class="infoBox__nazwa"><td></td><td><span><b>' +
            singleLocation.rodzaj +
            "</b></span></td></tr>" +
            '<tr class="infoBox__adres"><td><img class="infoBox__icon" src="../' +
            locationIc +
            '" /></td><td><span><b>' +
            singleLocation.ulica +
            "</b>, " +
            singleLocation.kod_pocztowy +
            " " +
            singleLocation.miasto +
            "</span></td></tr>" +
            otwarcie +
            tel_fax +
            '<tr class="infoBox__zakres"><td><img class="infoBox__icon" src="../' +
            info +
            '" /></td><td><span><b>' +
            singleLocation.zakres +
            "</b></span></td></tr>" +
            "</table>"
        );
        infoWindow.open(map, markersTest[index]);
      });
    });
  }
  locationsArray.length ? markersMaker(locationsArray) : "";

  function showVisible() {
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < markersTest.length; i++) {
      markersTest[i].setVisible(true);
      bounds.extend(markersTest[i].getPosition());
    }
    map.fitBounds(bounds);
  }
  markersTest.length ? showVisible() : "";

  var config = {
    styles: [
      {
        url: "../" + m1,
        height: 53,
        width: 53,
        textSize: 15,
        textColor: "#ffffff"
      }
    ]
  };
  if (markersTest.length) {
    var markerCluster = new MarkerClusterer(map, markersTest, config);
  }
  controller === "autoInit"
    ? showInDOM(locationsArray, "#datafetch", false, true)
    : "";
}

window.initMapPlac = initMapPlac;

$("<script/>", {
  type: "text/javascript",
  src:
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyAuav3OQX_e6zpfxBTZIo2o46pW64J2ykE&callback=initMapPlac"
}).appendTo("body");

$("<script/>", {
  type: "text/javascript",
  src:
    "https://cdn.rawgit.com/googlemaps/js-marker-clusterer/gh-pages/src/markerclusterer.js"
}).appendTo("body");

$("<script/>", {
  type: "text/javascript",
  src:
    "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js"
}).appendTo("body");

$("<script/>", {
  type: "text/javascript",
  src:
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/js/bootstrap.min.js"
}).appendTo("body");

$("<script/>", {
  type: "text/javascript",
  src: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"
}).appendTo("body");

$("<script/>", {
  type: "text/javascript",
  src: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"
}).appendTo("body");
