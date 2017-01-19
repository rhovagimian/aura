/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Function.RegisterNamespace("Test.Aura");

[Fixture]
Test.Aura.AuraLocalizationServiceTest = function(){
    var Aura = {
        Services: {   
        }
    };
	
    // Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
	Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "AuraLocalizationService":function(){}
    })(function() {
        [Import("aura-impl/src/main/resources/aura/AuraLocalizationService.js")]
	});

	var targetService = new Aura.Services.AuraLocalizationService();

	var targetDate = "07/10/2013";
	var targetDateFormat = "DD-MM-YYYY";
	var targetDateTime = "07/10/2013 12:00:00";
	var targetDateTimeFormat = "DD-MM-YYYY hh:mm:ss";
	var targetTime = "12:00:00";
	var targetTimeFormat = "hh:mm:ss";
	var targetLocale = "en";
	var targetTimezone = "PST";
	var targetNumber = 101;
	var targetPercent = '10%';
	var targetCurrency = '$100';
	var targetNumberFormat = "nFormat";
	var targetPercentFormat = "pFormat";
	var targetCurrencyFormat = "cFormat";

	var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
        assert: function () {},
        get:function(value){
            if(value == "$Locale.dateFormat") return targetDateFormat;
            if(value == "$Locale.datetimeFormat") return targetDateTimeFormat;
            if(value == "$Locale.timeFormat") return targetTimeFormat;
            if(value == "$Locale.timezone") return targetTimezone;
        	if(value == "$Locale.numberFormat") return targetNumberFormat;
			if(value == "$Locale.percentFormat") return targetPercentFormat;
			if(value == "$Locale.currencyFormat") return targetCurrencyFormat;
        },
        clientService: {
            loadClientLibrary: function (name, callback) {
                callback();
            }
        },
        lockerService: {
            instanceOf: function(value, type) {
                return value instanceof type;
            }
        }
    });

	var mockInvalidDate = {
		isValid:function(){
			return false;
		}
	};

	var mockDate = {
		isValid:function(){
			return true;
		},
		toString:function(){
			return targetDate;
		}
	};

	var mockDateTime = {
		isValid:function(){
			return true;
		},
		toString:function(){
			return targetDateTime;
		},
		toDate:function(){
			return targetDateTime;
		}
	};

	var mockTime = {
		isValid:function(){
			return true;
		},
		toString:function(){
			return targetTime;
		}
	};

	var mockMomentConstructor = Mocks.GetMock(Object.Global(), "moment", function(value, format, locale){
		if(value == mockDate) return mockDate;
		if(value == mockDateTime) return mockDateTime;
		if(value == mockTime) return mockTime;
		return mockInvalidDate;
	});

	var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
		utc:function(value){
			if(value == mockDate) return mockDate;
			if(value == mockDateTime) return mockDateTime;
			if(value == mockTime) return mockTime;
			return mockInvalidDate;
		},
		localeData:function(value){
			if(value == targetLocale || value == "zh-cn") return true;
			return false;
		}
	});

	var mockDisplayDateTime = Mocks.GetMock(targetService, "displayDateTime", function(mDate, format, locale){
		return mDate.toString() + format + locale;
    });

	var mockGetNormalizedFormat = Mocks.GetMock(targetService, "getNormalizedFormat", function(format){
		return format;
    });

	var mockGetNormalizedLangLocale = Mocks.GetMock(targetService, "getNormalizedLangLocale", function(locale){
		return locale;
    });

	var mockLazyInitTimeZoneInfo = Mocks.GetMock(targetService, "lazyInitTimeZoneInfo", function(timezone, callback){
		callback(mockDateTime, timezone);
    });

	var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
    	zones: {
    		PST:true,
    		EST:false
    	}
	});

    [Fixture]
    function displayDuration(){

    	var targetNoSuffix = "noSuffix";
    	var targetDuration={
    		humanize:function(noSuffix){
				if(noSuffix == targetNoSuffix)return true;
			},
			asDays:function(){
				return "365";
			},
			asHours:function(){
				return "24";
			},
			asMilliseconds:function(){
				return "3600000";
			},
			asMinutes:function(){
				return "60";
			},
			asMonths:function(){
				return "12";
			},
			asSeconds:function(){
				return "3600";
			},
			asYears:function(){
				return "2013";
			},
			days:function(){
				return "365";
			},
			hours:function(){
				return "24";
			},
			milliseconds:function(){
				return "3600000";
			},
			minutes:function(){
				return "60";
			},
			months:function(){
				return "12";
			},
			seconds:function(){
				return "3600";
			},
			years:function(){
				return "2013";
			}
		};

    	[Fact]
        function displayDuration(){
            // Arrange
            var expected = true;
            var actual;

            // Act
            actual = targetService.displayDuration(targetDuration, targetNoSuffix);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function displayDurationInDays(){
            // Arrange
            var expected = "365";
            var actual;

            // Act
            actual = targetService.displayDurationInDays(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function displayDurationInHours(){
            // Arrange
            var expected = "24";
            var actual;

            // Act
        	actual = targetService.displayDurationInHours(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function displayDurationInMilliseconds(){
            // Arrange
            var expected = "3600000";
            var actual;

            // Act
        	actual = targetService.displayDurationInMilliseconds(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function displayDurationInMinutes(){
            // Arrange
            var expected = "60";
            var actual;

            // Act
        	actual = targetService.displayDurationInMinutes(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function displayDurationInMonths(){
            // Arrange
            var expected = "12";
            var actual;

            // Act
        	actual = targetService.displayDurationInMonths(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function displayDurationInSeconds(){
            // Arrange
            var expected = "3600";
            var actual;

            // Act
            actual = targetService.displayDurationInSeconds(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function displayDurationInYears(){
            // Arrange
            var expected = "2013";
            var actual;

            // Act
        	actual = targetService.displayDurationInYears(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function getDaysInDuration(){
            // Arrange
            var expected = "365";
            var actual;

            // Act
        	actual = targetService.getDaysInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function getHoursInDuration(){
            // Arrange
            var expected = "24";
            var actual;

            // Act
        	actual = targetService.getHoursInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function getMillisecondsInDuration(){
            // Arrange
            var expected = "3600000";
            var actual;

            // Act
            actual = targetService.getMillisecondsInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function getMinutesInDuration(){
            // Arrange
            var expected = "60";
            var actual;

            // Act
            actual = targetService.getMinutesInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function getMonthsInDuration(){
            // Arrange
            var expected = "12";
            var actual;

            // Act
            actual = targetService.getMonthsInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function getSecondsInDuration(){
            // Arrange
            var expected = "3600";
            var actual;

            // Act
            actual = targetService.getSecondsInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function getYearsInDuration(){
            // Arrange
            var expected = "2013";
            var actual;

            // Act
            actual = targetService.getYearsInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function duration(){

    	var targetNum = "Num";
    	var targetUnit = "Unit";
    	var mockMoment = Mocks.GetMock(Object.Global(), 'moment',{
    		duration:function(num, unit){
    			if(unit){
    				if(num == targetNum && unit == targetUnit)return "With Unit";
    			}
    			else{
    				if(num == targetNum)return "Without Unit";
    			}
			}
		});

    	[Fact]
        function durationWithoutUnit(){
            // Arrange
            var expected = "Without Unit";
            var actual;

            // Act
            mockMoment(function(){
            	actual = targetService.duration(targetNum, undefined);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function durationWithUnit(){
            // Arrange
            var expected = "With Unit";
            var actual;

            // Act
            mockMoment(function(){
            	actual = targetService.duration(targetNum, targetUnit);
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function DateLimits(){

    	var targetDate = "date";
    	var targetUnit = "Unit";

    	var mockMomentConstr = Mocks.GetMock(Object.Global(), "moment", function(date){
			if(date == targetDate)return mockDuration;
		});

    	var mockDuration={
			endOf:function(unit){
				if(unit == targetUnit) {
					return {
						toDate:function(){
							return "endOf";
						}
					};
				}
			},
			startOf:function(unit){
				if(unit == targetUnit) {
					return {
						toDate:function(){
							return "startOf";
						}
					};
				}
			}
		};

    	[Fact]
        function endOf(){
            // Arrange
            var expected = "endOf";
            var actual;

            // Act
            mockMomentConstr(function(){
            	actual = targetService.endOf(targetDate, targetUnit);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function startOf(){
            // Arrange
            var expected = "startOf";
            var actual;

            // Act
            mockMomentConstr(function(){
            	actual = targetService.startOf(targetDate, targetUnit);
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatDate(){
    	[Fact]
        function InvalidDate(){
            // Arrange
            var expected = "Invalid date value";
            var actual;

            // Act
            mockMomentConstructor(function(){
            	actual = Record.Exception(function() {
            		targetService.formatDate("", targetDateFormat, targetLocale);
            	});
            });

            // Assert
            Assert.Equal(expected, actual.message);
        }

    	[Fact]
        function ValidDate(){
            // Arrange
            var expected = targetDate + targetDateFormat + targetLocale;
            var actual;

            // Act
    		mockMomentConstructor(function(){
    			mockDisplayDateTime(function(){
    				actual = targetService.formatDate(targetDate, targetDateFormat, targetLocale);
    			});
    		});


            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function NoFormat(){
            // Arrange
            var expected = targetDate + targetDateFormat + targetLocale;
            var actual;

            // Act
    		mockMomentConstructor(function(){
    			mockDisplayDateTime(function(){
    				mockUtil(function(){
    					actual = targetService.formatDate(targetDate, undefined, targetLocale);
    				});
    			});
    		});


            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatDateUTC(){

    	[Fact]
        function InvalidDate(){
            // Arrange
            var expected = "Invalid date value";
            var actual;

            // Act
            mockMoment(function(){
            	actual = Record.Exception(function() {
            		targetService.formatDateUTC("", targetDateFormat, targetLocale);
            	});
            });

            // Assert
            Assert.Equal(expected, actual.message);
        }

    	[Fact]
        function ValidDate(){
            // Arrange
            var expected = targetDate + targetDateFormat + targetLocale;
            var actual;

            // Act
    		mockMoment(function(){
    			mockDisplayDateTime(function(){
    				actual = targetService.formatDateUTC(targetDate, targetDateFormat, targetLocale);
    			});
    		});


            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function NoFormat(){
            // Arrange
            var expected = targetDate + targetDateFormat + targetLocale;
            var actual;

            // Act

    		mockMoment(function(){
    			mockDisplayDateTime(function(){
    				mockUtil(function(){
    					actual = targetService.formatDateUTC(targetDate, undefined, targetLocale);
    				});
    			});
    		});


            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatDateTime(){

    	[Fact]
        function InvalidDateTime(){
            // Arrange
            var expected = "Invalid date time value";
            var actual;

            // Act
            mockMomentConstructor(function(){
            	actual = Record.Exception(function() {
            		targetService.formatDateTime("", targetDateTimeFormat, targetLocale);
            	});
            });

            // Assert
            Assert.Equal(expected, actual.message);
        }

    	[Fact]
        function ValidDateTime(){
            // Arrange
            var expected = targetDateTime + targetDateTimeFormat + targetLocale;
            var actual;

            // Act
    		mockMomentConstructor(function(){
    			mockDisplayDateTime(function(){
    				actual = targetService.formatDateTime(targetDateTime, targetDateTimeFormat, targetLocale);
    			});
    		});


            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function NoFormat(){
            // Arrange
            var expected = targetDateTime + targetDateTimeFormat + targetLocale;
            var actual;

            // Act
    		mockMomentConstructor(function(){
    			mockDisplayDateTime(function(){
    				mockUtil(function(){
    					actual = targetService.formatDateTime(targetDateTime, undefined, targetLocale);
    				});
    			});
    		});


            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatDateTimeUTC(){

    	[Fact]
        function InvalidDateTime(){
            // Arrange
            var expected = "Invalid date time value";
            var actual;

            // Act
            mockMoment(function(){
            	actual = Record.Exception(function() {
            		targetService.formatDateTimeUTC("", targetDateTimeFormat, targetLocale);
            	});
            });

            // Assert
            Assert.Equal(expected, actual.message);
        }

    	[Fact]
        function ValidDateTime(){
            // Arrange
            var expected = targetDateTime + targetDateTimeFormat + targetLocale;
            var actual;

            // Act
    		mockMoment(function(){
    			mockDisplayDateTime(function(){
    				actual = targetService.formatDateTimeUTC(targetDateTime, targetDateTimeFormat, targetLocale);
    			});
    		});

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function NoFormat(){
            // Arrange
            var expected = targetDateTime + targetDateTimeFormat + targetLocale;
            var actual;

            // Act
    		mockMoment(function(){
    			mockDisplayDateTime(function(){
    				mockUtil(function(){
    					actual = targetService.formatDateTimeUTC(targetDateTime, undefined, targetLocale);
    				});
    			});
    		});

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatTime(){

    	[Fact]
        function InvalidTime(){
            // Arrange
            var expected = "Invalid time value";
            var actual;

            // Act
            mockMomentConstructor(function(){
            	actual = Record.Exception(function() {
            		targetService.formatTime("", targetTimeFormat, targetLocale);
            	});
            });

            // Assert
            Assert.Equal(expected, actual.message);
        }

    	[Fact]
        function ValidTime(){
            // Arrange
            var expected = targetTime + targetTimeFormat + targetLocale;
            var actual;

            // Act
    		mockMomentConstructor(function(){
    			mockDisplayDateTime(function(){
    				actual = targetService.formatTime(targetTime, targetTimeFormat, targetLocale);
    			});
    		});

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function NoFormat(){
            // Arrange
            var expected = targetTime + targetTimeFormat + targetLocale;
            var actual;

            // Act
    		mockMomentConstructor(function(){
    			mockDisplayDateTime(function(){
    				mockUtil(function(){
    					actual = targetService.formatTime(targetTime, undefined, targetLocale);
    				});
    			});
    		});

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatTimeUTC(){
    	[Fact]
        function InvalidTime(){
            // Arrange
            var expected = "Invalid time value";
            var actual;

            // Act
            mockMoment(function(){
            	actual = Record.Exception(function() {
            		targetService.formatTimeUTC("", targetTimeFormat, targetLocale);
            	});
            });

            // Assert
            Assert.Equal(expected, actual.message);
        }

    	[Fact]
        function ValidTime(){
            // Arrange
            var expected = targetTime + targetTimeFormat + targetLocale;
            var actual;

            // Act
    		mockMoment(function(){
    			mockDisplayDateTime(function(){
    				actual = targetService.formatTimeUTC(targetTime, targetTimeFormat, targetLocale);
    			});
    		});

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function NoFormat(){
            // Arrange
            var expected = targetTime + targetTimeFormat + targetLocale;
            var actual;

            // Act
    		mockMoment(function(){
    			mockDisplayDateTime(function(){
    				mockUtil(function(){
    					actual = targetService.formatTimeUTC(targetTime, undefined, targetLocale);
    				});
    			});
    		});

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function DateComparisons(){

    	var targetDate1 = "date1";
    	var targetDate2 = "date2";
    	var targetUnit = "unit";

    	var mockDuration={
			isAfter:function(date2, unit){
				if(date2 == targetDate2 && unit == targetUnit) return "isAfter";
			},
			isBefore:function(date2, unit){
				if(date2 == targetDate2 && unit == targetUnit) return "isBefore";
			},
			isSame:function(date2, unit){
				if(date2 == targetDate2 && unit == targetUnit) return "isSame";
			}
		};

    	var mockMomentConstr = Mocks.GetMock(Object.Global(), "moment", function(date){
			if(date == targetDate1)return mockDuration;
		});

	    [Fact]
	    function isAfter(){
	        // Arrange
	        var expected = "isAfter";
	        var actual;

	        //Act
	        mockMomentConstr(function(){
            	actual = targetService.isAfter(targetDate1, targetDate2, targetUnit);
            });

	        // Assert
	        Assert.Equal(expected, actual);
	    }


	    [Fact]
	    function isBefore(){
	        // Arrange
	        var expected = "isBefore";
	        var actual;

	        //Act
	        mockMomentConstr(function(){
            	actual = targetService.isBefore(targetDate1, targetDate2, targetUnit);
            });

	        // Assert
	        Assert.Equal(expected, actual);
	    }


	    [Fact]
	    function isSame(){
	        // Arrange
	        var expected = "isSame";
	        var actual;

	        //Act
	        mockMomentConstr(function(){
            	actual = targetService.isSame(targetDate1, targetDate2, targetUnit);
            });

	        // Assert
	        Assert.Equal(expected, actual);
	    }
    }

    [Fixture]
    function parseDateTime(){

    	var mockMomentConstr = Mocks.GetMock(Object.Global(), "moment", function(dateTimeString, format, locale){
    		if(dateTimeString == mockDateTime && format == targetDateTimeFormat && locale == targetLocale) return mockDateTime;
    		if(dateTimeString == "null") return null;
    		return mockInvalidDate;
    	});

    	[Fact]
        function InvalidDateTime(){
            // Arrange
            var expected = null;
            var actual;

            // Act
            mockMomentConstr(function(){
            	actual = targetService.parseDateTime("", targetDateTimeFormat, targetLocale);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function InValidFormat(){
            // Arrange
            var expected = null;
            var actual;

            // Act
            mockMomentConstr(function(){
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
            			actual = targetService.parseDateTime(targetDateTime, "", targetLocale);
            		});
            	});
    		});

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function InValidLocale(){
            // Arrange
            var expected = null;
            var actual;

            // Act
            mockMomentConstr(function(){
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
            			actual = targetService.parseDateTime(targetDateTime, targetDateTimeFormat, "");
            		});
            	});
    		});

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function NullDateTime(){
            // Arrange
            var expected = null;
            var actual;

            // Act
            mockMomentConstr(function(){
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
            			actual = targetService.parseDateTime("null", targetDateTimeFormat, targetLocale);
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function ValidDateTime(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            // Act
            mockMomentConstr(function(){
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
            			actual = targetService.parseDateTime(targetDateTime, targetDateTimeFormat, targetLocale);
            		});
            	});
    		});

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function parseDateTimeISO8601(){

    	var mockMomentConstr = Mocks.GetMock(Object.Global(), "moment", function(dateTimeString){
    		if(dateTimeString == mockDateTime) return mockDateTime;
    		if(dateTimeString == "null") return null;
    		return mockInvalidDate;
    	});

    	[Fact]
        function InvalidDateTime(){
            // Arrange
            var expected = null;
            var actual;

            // Act
            mockMomentConstr(function(){
            	actual = targetService.parseDateTimeISO8601("");
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function NullDateTime(){
            // Arrange
            var expected = null;
            var actual;

            // Act
            mockMomentConstr(function(){
            	actual = targetService.parseDateTimeISO8601("null");
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function ValidDateTime(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            // Act
            mockMomentConstr(function(){
    			actual = targetService.parseDateTimeISO8601(targetDateTime);
    		});

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function parseDateTimeUTC(){

    	var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
    		utc:function(dateTimeString, format, locale){
    			if(dateTimeString == mockDateTime && format == targetDateTimeFormat && locale == targetLocale) return mockDateTime;
    			if(dateTimeString == "null") return null;
        		return mockInvalidDate;
    		}
    	});

    	[Fact]
        function InvalidDateTime(){
            // Arrange
            var expected = null;
            var actual;

            // Act
            mockMoment(function(){
				actual = targetService.parseDateTimeUTC("", targetDateTimeFormat, targetLocale);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function InvalidFormat(){
            // Arrange
            var expected = null;
            var actual;

            // Act
            mockMoment(function(){
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
            			actual = targetService.parseDateTimeUTC(targetDateTime, "", targetLocale);
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function InValidLocale(){
            // Arrange
            var expected = null;
            var actual;

            // Act
            mockMoment(function(){
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
            			actual = targetService.parseDateTimeUTC(targetDateTime, targetDateTimeFormat, "");
            		});
            	});
    		});

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function NullDateTime(){
            // Arrange
            var expected = null;
            var actual;

            // Act
            mockMoment(function(){
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
        				actual = targetService.parseDateTimeUTC("null", targetDateTimeFormat, targetLocale);
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function ValidDateTime(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            // Act
            mockMoment(function(){
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
            			actual = targetService.parseDateTimeUTC(targetDateTime, targetDateTimeFormat, targetLocale);
            		});
            	});
    		});

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function toISOString(){

        [Fact]
        function Null(){
            // Arrange
            var expected = null;
            var actual;

            // Act
            actual = targetService.toISOString(null);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function EmptyString(){
            // Arrange
            var expected = '';
            var actual;

            // Act
            actual = targetService.toISOString('');

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function NotDateObject(){
            // Arrange
    		var expected = targetDate;
            var actual;

            // Act
            mockUtil(function() { 
                actual = targetService.toISOString(targetDate);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function DateObjectWithToISOString(){
            // Arrange
    		var dt = new Date(2004,10,23,12,30,59,123);
    		var expected = dt.getUTCFullYear() + "-" +
    					(dt.getUTCMonth() + 1) + "-" +
    					dt.getUTCDate() + "T" +
    					(dt.getUTCHours() < 10 ? '0' + dt.getUTCHours() : dt.getUTCHours()) + ':' +
    					dt.getUTCMinutes() + ':' +
    					dt.getUTCSeconds() + '.' +
    					dt.getUTCMilliseconds() + 'Z';
            var actual;

            // Act
            mockUtil(function() { 
                actual = targetService.toISOString(dt);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function DateObjectWithoutToISOString(){
            // Arrange
    		var dt = new Date(2004,10,23,12,30,59,123);
    		dt.toISOString = null;
    		var expected = dt.getUTCFullYear() + "-" +
    					(dt.getUTCMonth() + 1) + "-" +
    					dt.getUTCDate() + "T" +
    					(dt.getUTCHours() < 10 ? '0' + dt.getUTCHours() : dt.getUTCHours()) + ':' +
    					dt.getUTCMinutes() + ':' +
    					dt.getUTCSeconds() + '.' +
    					dt.getUTCMilliseconds() + 'Z';
            var actual;

            // Act
            mockUtil(function() { 
                actual = targetService.toISOString(dt);
            });
            
            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function UTCToWallTime(){

    	var actual;

    	var callback = function(dateObj){
    		actual = dateObj.toString();
    	};

    	var mockGetWallTimeFromUTC = Mocks.GetMock(targetService, "getWallTimeFromUTC", function(dateObj, timezone){
    		if(dateObj == mockDateTime) return dateObj;

        });

    	[Fact]
        function DateTimeInGMT(){
            // Arrange
            var expected = targetDateTime;

            // Act
            mockUtil(function () {
                targetService.UTCToWallTime(mockDateTime, "GMT", callback);    
            });
			

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function GetDefaultTimezone(){
            // Arrange
            var expected = targetDateTime;

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get:function(value){
                    if(value == "$Locale.timezone") return "UTC";
                },
                assert: function () {},
                clientService: {
                    loadClientLibrary: function (name, callback) {
                        callback();
                    }
                }
            });

            // Act
            mockUtil(function(){
				targetService.UTCToWallTime(mockDateTime, "", callback);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function TimezoneInfoAlreadyLoaded(){
            // Arrange
            var expected = targetDateTime;

            // Act
        	mockWallTime(function(){
    			mockGetWallTimeFromUTC(function(){
                    mockUtil(function () {
    				    targetService.UTCToWallTime(mockDateTime, targetTimezone, callback);
                    });
    			});
        	});

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function LoadTimezoneInfo(){
            // Arrange
            var expected = targetDateTime;

            // Act
        	mockWallTime(function(){
        		mockLazyInitTimeZoneInfo(function(){
            		mockGetWallTimeFromUTC(function(){
                        mockUtil(function () {
        				    targetService.UTCToWallTime(mockDateTime, "EST", callback);
                        });
            		});
        		});
        	});

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function WallTimeToUTC(){

    	var actual;

    	var callback = function(dateObj){
    		actual = dateObj.toString();
    	};

    	var mockGetUTCFromWallTime = Mocks.GetMock(targetService, "getUTCFromWallTime", function(dateObj, timezone){
    		if(dateObj == mockDateTime) return dateObj;

        });

    	[Fact]
        function DateTimeInGMT(){
            // Arrange
            var expected = targetDateTime;

            // Act
            mockUtil(function () {
			    targetService.WallTimeToUTC(mockDateTime, "GMT", callback);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function GetDefaultTimezone(){
            // Arrange
            var expected = targetDateTime;

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get:function(value){
                    if(value == "$Locale.timezone") return "UTC";
                },
                assert: function () {
                    return;
                },
                clientService: {
                    loadClientLibrary: function (name, callback) {
                        callback();
                    }
                }
            });

            // Act
            mockUtil(function(){
				targetService.WallTimeToUTC(mockDateTime, "", callback);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function TimezoneInfoAlreadyLoaded(){
            // Arrange
            var expected = targetDateTime;

            // Act
        	mockWallTime(function(){
        		mockGetUTCFromWallTime(function(){
                    mockUtil(function () {
    				    targetService.WallTimeToUTC(mockDateTime, targetTimezone, callback);
                    });
    			});
        	});

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function LoadTimezoneInfo(){
            // Arrange
            var expected = targetDateTime;

            // Act
        	mockWallTime(function(){
        		mockLazyInitTimeZoneInfo(function(){
        			mockGetUTCFromWallTime(function(){
                        mockUtil(function () {
        				    targetService.WallTimeToUTC(mockDateTime, "EST", callback);
                        });
            		});
        		});
        	});

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function displayDateTime(){

    	var targetFormat = "format";
    	var targetLang = "lang";

    	var targetDateTimeObj={
    		l:'',
    		f:'',
			locale:function(lang){
				if(lang == targetLang) this.l = lang;
			},
			format:function(format){
				if(format == targetFormat) this.f = format + this.l;
				return this.f;
			}
		};

    	[Fact]
        function InvalidLocale(){
            // Arrange
            var expected = targetFormat;
            var actual;

            // Act
            mockMoment(function () {
                mockGetNormalizedFormat(function(){
                    actual = targetService.displayDateTime(targetDateTimeObj, targetFormat, '');
                });    
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function validFormatAndLocale(){
            // Arrange
            var expected = targetFormat+targetLang;
            var actual;

            // Act
            mockGetNormalizedLangLocale(function(){
            	mockGetNormalizedFormat(function(){
            		actual = targetService.displayDateTime(targetDateTimeObj, targetFormat, targetLang);
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function getNormalizedFormat(){

    	var targetFormat = "DDMMYYYY";

    	[Fact]
        function inValidFormat(){
            // Arrange
            var expected = "";
            var actual;

            // Act
            actual = targetService.getNormalizedFormat("");

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function cacheHit(){
            // Arrange
            var expected = targetFormat;
            var actual;

            var mockCache = Mocks.GetMock(targetService, "cache", {
	            format: {
	    			DDMMYYYY:targetFormat
	    		}
            });

            // Act
            mockCache(function(){
            	actual = targetService.getNormalizedFormat(targetFormat);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function cacheMiss(){
            // Arrange
            var expected = targetFormat;
            var actual;

            var mockCache = Mocks.GetMock(targetService, "cache", {
        		format: {
        			ddMMyyyy:false
        		}
            });

            // Act
            mockCache(function(){
            	actual = targetService.getNormalizedFormat("ddMMyyyy");
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }
    
    [Fixture]
	function getStrictModeFormat(){

		var targetFormat = "DDMMYYYY";

		[Fact]
		function emptyFormat(){
			// Arrange
			var expected = "";
			var actual;

			// Act
			actual = targetService.getStrictModeFormat("");

			// Assert
			Assert.Equal(expected, actual);
		}

		[Fact]
		function dateOnlySingleLetterFormat(){
			// Arrange
			var expected = "D-M-YYYY";
			var actual;

			// Act
			actual = targetService.getStrictModeFormat("d-M-y");

			// Assert
			Assert.Equal(expected, actual);
		}


		[Fact]
		function dateOnlyDoubleLetterFormat(){
			// Arrange
			var expected = "D-M-YYYY";
			var actual;

			// Act
			actual = targetService.getStrictModeFormat("dd-MM-y");

			// Assert
			Assert.Equal(expected, actual);
		}

		[Fact]
		function dateTimeSingleLetterFormat(){
			// Arrange
			var expected = "D-M-YYYY h:m A";
			var actual;

			// Act
			actual = targetService.getStrictModeFormat("d-M-y h:m a");

			// Assert
			Assert.Equal(expected, actual);
		}

		[Fact]
		function dateTimeDoubleLetterFormat(){
			// Arrange
			var expected = "D-M-YYYY h:m A";
			var actual;

			// Act
			actual = targetService.getStrictModeFormat("dd-MM-y hh:mm a");

			// Assert
			Assert.Equal(expected, actual);
		}

		[Fact]
		function dateTimeNoSpaceAMPMFormat(){
			// Arrange
			var expected = "D-M-YYYY h:m A";
			var actual;

			// Act
			actual = targetService.getStrictModeFormat("dd-MM-y hh:mmA  ");

			// Assert
			Assert.Equal(expected, actual);
		}

		[Fact]
		function dateTimeExtraSpaceAMPMFormat(){
			// Arrange
			var expected = "D-M-YYYY h:m A";
			var actual;

			// Act
			actual = targetService.getStrictModeFormat("dd-MM-y hh:mm   A  ");

			// Assert
			Assert.Equal(expected, actual);
		}

		[Fact]
		function dateTime24HrFormat(){
			// Arrange
			var expected = "D-M-YYYY H:m";
			var actual;

			// Act
			actual = targetService.getStrictModeFormat("d-M-y HH:mm");

			// Assert
			Assert.Equal(expected, actual);
		}
	}

    [Fixture]
    function getNormalizedLangLocale(){

    	[Fact]
        function inValidFormat(){
            // Arrange
            var expected = "";
            var actual;

            // Act
            actual = targetService.getNormalizedLangLocale("");

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function cacheHit(){
            // Arrange
            var expected = targetLocale;
            var actual;

            var mockCache = Mocks.GetMock(targetService, "cache", {
            	langLocale: {
	    			en:targetLocale
	    		}
            });

            // Act
            mockCache(function(){
            	actual = targetService.getNormalizedLangLocale(targetLocale);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function cacheMiss(){
            // Arrange
            var expected = targetLocale;
            var actual;

            var mockCache = Mocks.GetMock(targetService, "cache", {
            	langLocale: {
        			en:false
        		}
            });

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
				util: {
	            	isEmpty: function() { return true; }
	            }
	        });

            // Act
            mockCache(function(){
            	mockUtil(function(){
            		mockMoment(function(){
            			actual = targetService.getNormalizedLangLocale(targetLocale);
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function cacheMissInvalidLang(){
            // Arrange
            var expected = targetLocale;
            var actual;

            var mockCache = Mocks.GetMock(targetService, "cache", {
            	langLocale: {
        			en:false
        		}
            });

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
				util: {
	            	isEmpty: function() { return true; }
	            }
	        });

            // Act
            mockCache(function(){
            	mockUtil(function(){
            		mockMoment(function(){
            			actual = targetService.getNormalizedLangLocale("xx");
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function cacheMissCompoundLang(){
            // Arrange
            var expected = "zh-cn";
            var actual;

            var mockCache = Mocks.GetMock(targetService, "cache", {
            	langLocale: {
        			en:false
        		}
            });

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
				util: {
	            	isEmpty: function() { return false; }
	            }
	        });

            // Act
            mockCache(function(){
            	mockUtil(function(){
            		mockMoment(function(){
            			actual = targetService.getNormalizedLangLocale("ZH_CN");
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function cacheMissInvalidCompoundLang(){
            // Arrange
            var expected = targetLocale;
            var actual;

            var mockCache = Mocks.GetMock(targetService, "cache", {
            	langLocale: {
        			en:false
        		}
            });

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
				util: {
	            	isEmpty: function() { return false; }
	            }
	        });

            // Act
            mockCache(function(){
            	mockUtil(function(){
            		mockMoment(function(){
            			actual = targetService.getNormalizedLangLocale("xx_ca");
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function cacheMissInvalidCompoundCountry(){
            // Arrange
            var expected = targetLocale;
            var actual;

            var mockCache = Mocks.GetMock(targetService, "cache", {
            	langLocale: {
        			en:false
        		}
            });

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
				util: {
	            	isEmpty: function() { return false; }
	            }
	        });

            // Act
            mockCache(function(){
            	mockUtil(function(){
            		mockMoment(function(){
            			actual = targetService.getNormalizedLangLocale("en_xx");
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function initTimeZoneInfo(){

    	[Fact]
        function callbackGetsCalled(){
        	// Arrange
        	var expected = "called";
        	var actual;

        	var targetCallback = function(){
        		actual = "called";
        	};

        	var mockEnqueuedAction={
    			getState:function(){
    				return "FAILURE";
    			}
        	};

        	var mockAction={
    			timezoneId:'',
        		setParams:function(id){
        			if(id == targetTimezone)this.timezoneId = id;
				},
				setCallback:function(service, callback){
					callback(mockEnqueuedAction);
				}
        	};

			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
				get:function(expression){
					if(expression=="c.aura://TimeZoneInfoController.getTimeZoneInfo") return mockAction;
				},
                enqueueAction: function(a) { if(a != mockAction) throw new Error("Wrong Action enqueued"); }
            });

			mockUtil(function(){
				targetService.initTimeZoneInfo(targetTimezone, targetCallback);
			});

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SuccessWithWalltimeInitialized(){
        	// Arrange
        	var expected = "called";
        	var actual;

        	var targetCallback = function(){
        		actual = "called";
        	};

        	var mockWalltimeData = {
				rules: 'ru',
	    		zones: 'zo'
			}

        	var mockEnqueuedAction={
    			getState:function(){
    				return "SUCCESS";
    			},
        		returnValue : mockWalltimeData
        	};

        	var mockAction={
    			timezoneId:'',
        		setParams:function(id){
        			if(id == targetTimezone)this.timezoneId = id;
				},
				setCallback:function(service, callback){
					callback(mockEnqueuedAction);
				}
        	};

			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
				get:function(expression){
					if(expression=="c.aura://TimeZoneInfoController.getTimeZoneInfo") return mockAction;
				},
                enqueueAction: function(a) { if(a != mockAction) throw new Error("Wrong Action enqueued"); }
            });

			var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
		    	data: '',
		    	zones: true,
		    	addRulesZones : function(a, b){
		    		if(a != 'ru' && b != 'zo') throw new Error("Wrong arguments in walltime.addRulesZones a:" + a + ", b:" + b );
    			},
		    	autoinit: '',
		    	init: function(a, b){
		    		if(this.autoinit == false) throw new Error("walltime.autoinit is not set to true");
		    		if(a != 'ru' && b != 'zo') throw new Error("Wrong arguments in walltime.init a:" + a + ", b:" + b );
		    	}
			});

			mockUtil(function(){
				mockWallTime(function(){
					targetService.initTimeZoneInfo(targetTimezone, targetCallback);
				});
			});

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SuccessWithWalltimeNotInitialized(){
        	// Arrange
        	var expected = "called";
        	var actual;

        	var targetCallback = function(){
        		actual = "called";
        	};

        	var mockWalltimeData = {
				rules: 'ru',
	    		zones: 'zo'
			}

        	var mockEnqueuedAction={
    			getState:function(){
    				return "SUCCESS";
    			},
        		returnValue : mockWalltimeData
        	};

        	var mockAction={
    			timezoneId:'',
        		setParams:function(id){
        			if(id == targetTimezone)this.timezoneId = id;
				},
				setCallback:function(service, callback){
					callback(mockEnqueuedAction);
				}
        	};

			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
				get:function(expression){
					if(expression=="c.aura://TimeZoneInfoController.getTimeZoneInfo") return mockAction;
				},
                enqueueAction: function(a) { if(a != mockAction) throw new Error("Wrong Action enqueued"); }
            });

			var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
		    	data: '',
		    	zones: false,
		    	addRulesZones : function(a, b){
		    		if(a != 'ru' && b != 'zo') throw new Error("Wrong arguments in walltime.addRulesZones a:" + a + ", b:" + b );
    			},
		    	autoinit: '',
		    	init: function(a, b){
		    		if(this.autoinit == false) throw new Error("walltime.autoinit is not set to true");
		    		if(a != 'ru' && b != 'zo') throw new Error("Wrong arguments in walltime.init a:" + a + ", b:" + b );
		    	}
			});

			mockUtil(function(){
				mockWallTime(function(){
					targetService.initTimeZoneInfo(targetTimezone, targetCallback);
				});
			});

            // Assert
            Assert.Equal(expected, actual);
        }
    }
    
    [Fixture]
    function lazyInitTimeZoneInfo() {
    	
    	[Fact]
    	function initTimeZoneInfoCalledOncePerTimezone(){
        	// Arrange
        	var initTimeZoneInfoCalls = [];
        	
        	var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
            	zones: {
            		PST:false,
            		EST:false
            	}
        	});

        	var mockInitializeWalltime = Mocks.GetMock(targetService, "initializeWalltime", function(callback) {
                callback();
        	})
        	
        	var mockInitTimeZoneInfo = Mocks.GetMock(targetService, "initTimeZoneInfo", function(timezone, afterInit) {
        		initTimeZoneInfoCalls.push(timezone);
                afterInit();
        	})
    		
        	// Act
        	mockWallTime(function() {
        		mockInitializeWalltime(function() {
        			mockInitTimeZoneInfo(function() {
        				targetService.lazyInitTimeZoneInfo("PST", function() {});
        				targetService.lazyInitTimeZoneInfo("PST", function() {});
        				targetService.lazyInitTimeZoneInfo("EST", function() {});
        			})
        		})
        	});
    		
    		// Assert
    		Assert.Equal(["PST", "EST"], initTimeZoneInfoCalls);
    	}
    }

    [Fixture]
    function getUTCFromWallTime(){

    	[Fact]
        function validDateTime(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
		    	WallTimeToUTC : function(timezone, d){
		    		if(timezone == targetTimezone && d == targetDateTime) return targetDateTime;
    			}
			});

            // Act
            mockWallTime(function(){
            	actual = targetService.getUTCFromWallTime(targetDateTime, targetTimezone);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function inValidDateTimeDefaultLocale(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
		    	WallTimeToUTC : function(timezone, d){
		    		if(timezone == targetTimezone && d == targetDateTime) throw new Error();
    			}
			});

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get:function(value) {
                    if(value == "$Locale.timezone") return "GMT";
                }
            });

            // Act
            mockWallTime(function(){
            	mockUtil(function(){
            		actual = targetService.getUTCFromWallTime(targetDateTime, targetTimezone);
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function inValidDateTimeOtherLocale(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
		    	WallTimeToUTC : function(timezone, d){
		    		if(timezone == "" && d == targetDateTime) throw new Error();
		    		if(timezone == targetTimezone && d == targetDateTime) return targetDateTime;
    			}
			});

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get:function(value) {
                    if(value == "$Locale.timezone") return targetTimezone;
                }
            });

            // Act
            mockWallTime(function(){
            	mockUtil(function(){
            		actual = targetService.getUTCFromWallTime(targetDateTime, "");
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function inValidDateTimeException(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
		    	WallTimeToUTC : function(timezone, d){
		    		if(timezone == "" && d == targetDateTime) throw new Error();
		    		if(timezone == targetTimezone && d == targetDateTime) throw new Error();
    			}
			});

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get:function(value) {
                    if(value == "$Locale.timezone") return targetTimezone;
                }
            });

            // Act
            mockWallTime(function(){
            	mockUtil(function(){
            		actual = targetService.getUTCFromWallTime(targetDateTime, "");
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }


    [Fixture]
    function getWallTimeFromUTC(){

    	[Fact]
        function validDateTime(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            var mockTime ={
        		wallTime : targetDateTime
            };

            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
            	UTCToWallTime : function(d, timezone){
		    		if(timezone == targetTimezone && d == targetDateTime) return mockTime;
    			}
			});

            // Act
            mockWallTime(function(){
            	actual = targetService.getWallTimeFromUTC(targetDateTime, targetTimezone);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function inValidDateTimeDefaultLocale(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
            	UTCToWallTime : function(d, timezone){
		    		if(timezone == targetTimezone && d == targetDateTime) throw new Error();
    			}
			});

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
        		get:function(value) {
                    if(value == "$Locale.timezone") return "GMT";
                }
            });

            // Act
            mockWallTime(function(){
            	mockUtil(function(){
            		actual = targetService.getWallTimeFromUTC(targetDateTime, targetTimezone);
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function inValidDateTimeOtherLocale(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            var mockTime ={
        		wallTime : targetDateTime
            };

            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
            	UTCToWallTime : function(d, timezone){
		    		if(timezone == "" && d == targetDateTime) throw new Error();
		    		if(timezone == targetTimezone && d == targetDateTime) return mockTime;
    			}
			});

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get:function(value) {
                    if(value == "$Locale.timezone") return targetTimezone;
                }
            });

            // Act
            mockWallTime(function(){
            	mockUtil(function(){
            		actual = targetService.getWallTimeFromUTC(targetDateTime, "");
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function inValidDateTimeException(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
            	UTCToWallTime : function(d, timezone){
		    		if(timezone == "" && d == targetDateTime) throw new Error();
		    		if(timezone == targetTimezone && d == targetDateTime) throw new Error();
    			}
			});

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get:function(value) {
                    if(value == "$Locale.timezone") return targetTimezone;
                }
            });

            // Act
            mockWallTime(function(){
            	mockUtil(function(){
            		actual = targetService.getWallTimeFromUTC(targetDateTime, "");
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function init(){

    	[Fact]
        function invalidLangLocale(){
            // Arrange
            var expected = '';
            var actual = '';

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get:function(value) {
                    if(value == "$Locale.langLocale") return '';
                }
            });

            // Act
            mockMoment(function () {
                mockUtil(function(){
        			targetService.init();
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function validLangLocale(){
            // Arrange
            var expected = targetLocale;
            var actual;

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get:function(value) {
                    if(value == "$Locale.langLocale") return targetLocale;
                }
            });

            var mockGetNormalizedLangLocale = Mocks.GetMock(targetService, "getNormalizedLangLocale", function(locale){
        		if(locale == targetLocale)return locale;
            });

        	var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
        		locale:function(value){
        			if(value == targetLocale)actual = value;
        		}
        	});

            // Act
            mockUtil(function(){
            	mockGetNormalizedLangLocale(function(){
            		mockMoment(function(){
            			targetService.init();
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatNumbers(){

    	[Fact]
        function formatNumber(){
            // Arrange
            var expected = targetNumber;
            var actual;

            var mockGetDefaultNumberFormat = Mocks.GetMock(targetService, "getDefaultNumberFormat", function(){
            	return {
            		format: function(number){
            			if(number == targetNumber) return targetNumber;
            		}
            	};
			});

            // Act
            mockGetDefaultNumberFormat(function(){
            	actual = targetService.formatNumber(targetNumber);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function formatPercent(){
            // Arrange
            var expected = targetPercent;
            var actual;

            var mockGetDefaultPercentFormat = Mocks.GetMock(targetService, "getDefaultPercentFormat", function(){
            	return {
            		format: function(number){
            			if(number == targetPercent) return targetPercent;
            		}
            	};
			});

            // Act
            mockGetDefaultPercentFormat(function(){
            	actual = targetService.formatPercent(targetPercent);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function formatCurrency(){
            // Arrange
            var expected = targetCurrency;
            var actual;

            var mockGetDefaultCurrencyFormat = Mocks.GetMock(targetService, "getDefaultCurrencyFormat", function(){
            	return {
            		format: function(number){
            			if(number == targetCurrency) return targetCurrency;
            		}
            	};
			});

            // Act
            mockGetDefaultCurrencyFormat(function(){
            	actual = targetService.formatCurrency(targetCurrency);
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function getNumberFormat(){

    	[Fact]
        function getNumberFormat(){
            // Arrange
    		var actual;
            var targetSymbols = '###';
    		var mockNumberFormat = {};

            var mockNumberFormatConstructor = Mocks.GetMock(Object.Global(), "Aura", { "Utils" : {"NumberFormat": function(format, symbols){
        		if(format == targetNumberFormat && symbols == targetSymbols) return mockNumberFormat;
        	}}});

            // Act
            mockNumberFormatConstructor(function(){
            	actual = targetService.getNumberFormat(targetNumberFormat, targetSymbols);
            });

            // Assert
            Assert.Equal(mockNumberFormat, actual);
        }
    }

    [Fixture]
    function getDefaultFormats(){

    	[Fact]
        function getNumberFormat(){
            // Arrange
    		var actual;
    		var mockNumberFormat = {};

            var mockNumberFormatConstructor = Mocks.GetMock(Object.Global(), "Aura", { "Utils" : {"NumberFormat": function(val){
        		if(val == targetNumberFormat) return mockNumberFormat;
        	}}});

            // Act
            mockUtil(function(){
            	mockNumberFormatConstructor(function(){
            		actual = targetService.getDefaultNumberFormat();
            	});
            });

            // Assert
            Assert.Equal(mockNumberFormat, actual);
        }

    	[Fact]
        function getDefaultPercentFormat(){
            // Arrange
    		var actual;
    		var mockNumberFormat = {};

            var mockNumberFormatConstructor = Mocks.GetMock(Object.Global(), "Aura", { "Utils" : {"NumberFormat": function(val){
        		if(val == targetPercentFormat) return mockNumberFormat;
        	}}});

            // Act
            mockUtil(function(){
            	mockNumberFormatConstructor(function(){
            		actual = targetService.getDefaultPercentFormat();
            	});
            });

            // Assert
            Assert.Equal(mockNumberFormat, actual);
        }

    	[Fact]
        function getDefaultCurrencyFormat(){
            // Arrange
    		var actual;
    		var mockNumberFormat = {};

            var mockNumberFormatConstructor = Mocks.GetMock(Object.Global(), "Aura", { "Utils" : {"NumberFormat": function(val){
        		if(val == targetCurrencyFormat) return mockNumberFormat;
        	}}});

            // Act
            mockUtil(function(){
            	mockNumberFormatConstructor(function(){
            		actual = targetService.getDefaultCurrencyFormat();
            	});
            });

            // Assert
            Assert.Equal(mockNumberFormat, actual);
        }
    }

    [Fixture]
    function pad(){

    	[Fact]
        function pad0(){
            // Arrange
    		var expected = '00';
    		var actual;

            // Act
    		actual = targetService.pad(0);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function pad1(){
            // Arrange
    		var expected = '01';
    		var actual;

            // Act
    		actual = targetService.pad(1);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function pad9(){
            // Arrange
    		var expected = '09';
    		var actual;

            // Act
    		actual = targetService.pad(9);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function pad10(){
            // Arrange
    		var expected = '10';
    		var actual;

            // Act
    		actual = targetService.pad(10);

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function doublePad(){

    	[Fact]
        function pad0(){
            // Arrange
    		var expected = '000';
    		var actual;

            // Act
    		actual = targetService.doublePad(0);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function pad1(){
            // Arrange
    		var expected = '001';
    		var actual;

            // Act
    		actual = targetService.doublePad(1);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function pad9(){
            // Arrange
    		var expected = '099';
    		var actual;

            // Act
    		actual = targetService.doublePad(99);

            // Assert
            Assert.Equal(expected, actual);
        }

    	[Fact]
        function pad10(){
            // Arrange
    		var expected = '100';
    		var actual;

            // Act
    		actual = targetService.doublePad(100);

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
