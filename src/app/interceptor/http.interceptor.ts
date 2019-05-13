import { Injectable } from '@angular/core';
import {
  HttpHeaders
} from '@angular/common/http';

export const HTTP_OPTIONS = {
    headers: new HttpHeaders(
      {'Content-Type': 'application/json'}),
    withCredentials: true,
};
