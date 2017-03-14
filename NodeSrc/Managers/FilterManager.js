/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc Handles all the Filter related operations
 *
 */

var express = require("express");
var app = require("../server").app;

class FilterManager {

  constructor()
    {

        this.router = express.Router();


        this.router.post("/listpredefined",(req, res) => { this.getAllPredefinedFilters(req,res); });
    }

  	/*
  	 * @desc Returns all the predefined filters
  	 */
  	getAllPredefinedFilters(req,res)
  	{
        var predefinedFiltersList = [
            {id: 1, name: "All Users", filter: null},
            {id: 2, name: "New Users", filter: null},
            {id: 3, name: "Slipping Away", filter: null},
        ];
        return res.send({status:predefinedFiltersList});

  	}
}


module.exports.FilterManager = FilterManager;
