const { assign } = require('xstate');
const { pgrService } = require('./service/service-loader');
const dialog = require('./util/dialog');
const localisationService = require('./util/localisation-service');
const config = require('../env-variables');
const moment = require("moment-timezone");

const pgr =  {
  id: 'pgr',
  initial: 'pgrmenu',
  onEntry: assign((context, event) => {
    context.slots.pgr = {}
    context.pgr = {slots: {}};
  }),
  states: {
    pgrmenu : {
      id: 'pgrmenu',
      initial: 'question',
      states: {
        question: {
          onEntry: assign( (context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.pgrmenu.question, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        }, // pgrmenu.question
        process: {
          onEntry: assign((context, event) => context.intention = dialog.get_intention(grammer.pgrmenu.question, event)),
          always : [
            {
              target: '#fileComplaint',
              cond: (context) => context.intention == 'file_new_complaint'
            },
            {
              target: '#trackComplaint', 
              cond: (context) => context.intention == 'track_existing_complaints'
            },
            {
              target: 'error'
            }
          ]
        }, // pgrmenu.process
        error: {
          onEntry: assign( (context, event) => dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false)),
          always : 'question'
        } // pgrmenu.error
      }, // pgrmenu.states
    }, // pgrmenu
    fileComplaint: {
      id: 'fileComplaint',
      initial: 'type',
      states: {
        type: {
          id: 'type',
          initial: 'complaintType',
          states: {
            complaintType: {
              id: 'complaintType',
              initial: 'question',
              states: {
                question: {
                  invoke: {
                    src: (context) => pgrService.fetchFrequentComplaints(context.extraInfo.tenantId),
                    id: 'fetchFrequentComplaints',
                    onDone: {
                      actions: assign((context, event) => {
                        let preamble = dialog.get_message(messages.fileComplaint.complaintType.question.preamble, context.user.locale);
                        let {complaintTypes, messageBundle} = event.data;
                        let {prompt, grammer} = dialog.constructListPromptAndGrammer(complaintTypes, messageBundle, context.user.locale, true);
                        context.grammer = grammer; // save the grammer in context to be used in next step
                        dialog.sendMessage(context, `${preamble}${prompt}`);
                      }) 
                    },
                    onError: {
                      target: '#system_error'
                    }
                  },
                  on: {
                    USER_MESSAGE: 'process'
                  }
                }, //question
                process: {
                  onEntry: assign((context, event) => {
                    context.intention = dialog.get_intention(context.grammer, event) 
                  }),
                  always: [
                    {
                      target: '#complaintType2Step',
                      cond: (context) => context.intention == dialog.INTENTION_MORE
                    },
                    {
                      target: '#location',
                      cond: (context) => context.intention != dialog.INTENTION_UNKOWN,
                      actions: assign((context, event) => {
                        context.slots.pgr["complaint"]= context.intention;
                      })
                    },
                    {
                      target: 'error'
                    }
                  ]
                }, // process
                error: {
                  onEntry: assign( (context, event) => {
                    dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
                  }),
                  always: 'question',
                } // error
              } // states of complaintType
            }, // complaintType
            complaintType2Step: {
              id: 'complaintType2Step',
              initial: 'complaintCategory',
              states: {
                complaintCategory: {
                  id: 'complaintCategory',
                  initial: 'question',
                  states: {
                    question: {
                      invoke:  {                  
                        src: (context, event)=>pgrService.fetchComplaintCategories(context.extraInfo.tenantId),
                        id: 'fetchComplaintCategories',
                        onDone: {
                          actions: assign((context, event) => {
                            let { complaintCategories, messageBundle } = event.data;
                            let preamble = dialog.get_message(messages.fileComplaint.complaintType2Step.category.question.preamble, context.user.locale);
                            let {prompt, grammer} = dialog.constructListPromptAndGrammer(complaintCategories, messageBundle, context.user.locale);

                            let lengthOfList = grammer.length;
                            let otherTypeGrammer = { intention: 'Others', recognize: [ (lengthOfList + 1).toString() ] };
                            prompt += `\n${lengthOfList + 1}. ` + dialog.get_message(messages.fileComplaint.complaintType2Step.category.question.otherType, context.user.locale);
                            grammer.push(otherTypeGrammer);

                            context.grammer = grammer; // save the grammer in context to be used in next step
                            dialog.sendMessage(context, `${preamble}${prompt}`);
                          }),
                        }, 
                        onError: {
                          target: '#system_error'
                        }
                      },
                      on: {
                        USER_MESSAGE: 'process'
                      }
                    }, //question
                    process: {
                      onEntry: assign((context, event) => {
                        context.intention = dialog.get_intention(context.grammer, event, true) 
                      }),
                      always: [
                        {
                          target: '#location',
                          cond: (context) => context.intention == 'Others',
                          actions: assign((context, event) => {
                            context.slots.pgr["complaint"] = context.intention;
                          })
                        },
                        {
                          target: '#complaintItem',
                          cond: (context) => context.intention != dialog.INTENTION_UNKOWN
                        },
                        {
                          target: 'error'
                        }
                      ]
                    }, // process
                    error: {
                      onEntry: assign( (context, event) => {
                        dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
                      }),
                      always:  'question',
                    } // error
                  } // states of complaintCategory
                }, // complaintCategory
                complaintItem: {
                  id: 'complaintItem',
                  initial: 'question',
                  states: {
                    question: {
                      invoke:  {                  
                        src: (context) => pgrService.fetchComplaintItemsForCategory(context.intention,context.extraInfo.tenantId),
                        id: 'fetchComplaintItemsForCategory',
                        onDone: {
                          actions: assign((context, event) => {
                            let { complaintItems, messageBundle } = event.data;
                            let preamble = dialog.get_message(messages.fileComplaint.complaintType2Step.item.question.preamble, context.user.locale);
                            let {prompt, grammer} = dialog.constructListPromptAndGrammer(complaintItems, messageBundle, context.user.locale, false, true);
                            context.grammer = grammer; // save the grammer in context to be used in next step
                            dialog.sendMessage(context, `${preamble}${prompt}`);
                          })
                        }, 
                        onError: {
                          target: '#system_error'
                        }
                      },
                      on: {
                        USER_MESSAGE: 'process'
                      }
                    }, //question
                    process: {
                      onEntry: assign((context, event) => {
                        context.intention = dialog.get_intention(context.grammer, event) 
                      }),
                      always: [
                        {
                          target: '#complaintCategory',
                          cond: (context) => context.intention == dialog.INTENTION_GOBACK
                        },
                        {
                          target: '#location',
                          cond: (context) => context.intention != dialog.INTENTION_UNKOWN,
                          actions: assign((context, event) => {
                            context.slots.pgr["complaint"]= context.intention;
                          })
                        },
                        {
                          target: 'error'
                        }
                      ]
                    }, // process
                    error: {
                      onEntry: assign( (context, event) => {
                        dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
                      }),
                      always:  'question',
                    } // error
                  } // states of complaintItem
                }, // complaintItem
              } // states of complaintType2Step
            }, // complaintType2Step
          }
        },
        location: {
          id: 'location',
          initial: 'geoLocationSharingInfo',
          states: {
            geoLocationSharingInfo: {
              id: 'geoLocationSharingInfo',
              onEntry: assign( (context, event) => {
                let image = pgrService.getImage();
                context.extraInfo = config.informationImageFilestoreId;
                dialog.sendMessage(context, image, false);
              }),
              always: 'geoLocation'
            },
            geoLocation: {
              id: 'geoLocation',
              initial: 'question',
              states : {
                question: {
                  onEntry: assign( (context, event) => {
                    let message = dialog.get_message(messages.fileComplaint.geoLocation.question, context.user.locale)
                    dialog.sendMessage(context, message);
                  }),
                  on: {
                    USER_MESSAGE: 'process'
                  }
                },
                process: {
                  invoke: {
                    id: 'getCityAndLocality',
                    src: (context, event) => {
                      if(event.message.type === 'location') {
                        context.slots.pgr.geocode = event.message.input;
                        return pgrService.getCityAndLocalityForGeocode(event.message.input, context.extraInfo.tenantId);
                      }
                      return Promise.resolve();
                    },
                    onDone: [
                      {
                        target: '#confirmLocation',
                        cond: (context, event) => event.data,
                        actions: assign((context, event) => {
                          context.pgr.detectedLocation = event.data;
                        })
                      },
                      {
                        target: '#city'
                      }
                    ],
                    onError: {
                      target: '#city'
                    }
                  }
                }
              }
            },
            confirmLocation: {
              id: 'confirmLocation',
              initial: 'question',
              states: {
                question: {
                  onEntry: assign((context, event) => {
                    let message;
                    if(context.pgr.detectedLocation.locality) {
                      let localityName = dialog.get_message(context.pgr.detectedLocation.matchedLocalityMessageBundle, context.user.locale);
                      message = dialog.get_message(messages.fileComplaint.confirmLocation.confirmCityAndLocality, context.user.locale);
                      message = message.replace('{{locality}}', localityName);
                    } else {
                      message = dialog.get_message(messages.fileComplaint.confirmLocation.confirmCity, context.user.locale);                      
                    }
                    let cityName = dialog.get_message(context.pgr.detectedLocation.matchedCityMessageBundle, context.user.locale);
                    message = message.replace('{{city}}', cityName);
                    dialog.sendMessage(context, message);
                  }),
                  on: {
                    USER_MESSAGE: 'process'
                  }
                },
                process: {
                  onEntry: assign((context, event) => {
                    // TODO: Generalised "disagree" intention
                    if(event.message.input.trim().toLowerCase() === 'no') {
                      context.slots.pgr["locationConfirmed"] = false;
                    } else {
                      context.slots.pgr["locationConfirmed"] = true;
                      context.slots.pgr.city = context.pgr.detectedLocation.city;
                      if(context.pgr.detectedLocation.locality) {
                        context.slots.pgr.locality = context.pgr.detectedLocation.locality;
                      }
                    }
                  }),
                  always: [
                    {
                      target: '#persistComplaint',
                      cond: (context, event) => context.slots.pgr["locationConfirmed"]  && context.slots.pgr["locality"]
                    },
                    {
                      target: '#locality',
                      cond: (context, event) => context.slots.pgr["locationConfirmed"] 
                    },
                    {
                      target: '#city'
                    }
                  ]
                }
              }
            },
            city: {
              id: 'city',
              initial: 'question',
              states: {
                question: {
                  invoke: {
                    id: 'fetchCities',
                    src: (context, event) => pgrService.fetchCities(context.extraInfo.tenantId),
                    onDone: {
                      actions: assign((context, event) => {
                        let { cities, messageBundle } = event.data;
                        let preamble = dialog.get_message(messages.fileComplaint.city.question.preamble, context.user.locale);
                        let link = pgrService.getCityExternalWebpageLink(context.extraInfo.tenantId, context.extraInfo.whatsAppBusinessNumber);
                        let message = preamble + '\n' + link;
                        context.grammer = dialog.constructLiteralGrammer(cities, messageBundle, context.user.locale);
                        dialog.sendMessage(context, message);
                      })
                    },
                    onError: {
                      target: '#system_error'
                    }
                  },
                  on: {
                    USER_MESSAGE: 'process'
                  }
                },
                process: {
                  onEntry:  assign((context, event) => {
                    context.intention = dialog.get_intention(context.grammer, event) 
                  }),
                  always : [
                    {
                      target: '#locality',
                      cond: (context) => context.intention != dialog.INTENTION_UNKOWN,
                      actions: assign((context, event) => context.slots.pgr["city"] = context.intention)    
                    },
                    {
                      target: 'error',
                    }, 
                  ]
                },
                error: {
                  onEntry: assign( (context, event) => {
                    dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
                  }),
                  always:  'question',
                }
              }
            },
            locality: {
              id: 'locality',
              initial: 'question',
              states: {
                question: {
                  invoke: {
                    id: 'fetchLocalities',
                    src: (context) => pgrService.fetchLocalities(context.slots.pgr.city),
                    onDone: {
                      actions: assign((context, event) => {
                        let { localities, messageBundle } = event.data;
                        let preamble = dialog.get_message(messages.fileComplaint.locality.question.preamble, context.user.locale);
                        let link = pgrService.getLocalityExternalWebpageLink(context.slots.pgr.city, context.extraInfo.whatsAppBusinessNumber);
                        let message = preamble + '\n' + link;
                        context.grammer = dialog.constructLiteralGrammer(localities, messageBundle, context.user.locale);
                        dialog.sendMessage(context, message);
                      })
                    },
                    onError: {
                      target: '#system_error'
                    }
                  },
                  on: {
                    USER_MESSAGE: 'process'
                  }
                },
                process: {
                  onEntry:  assign((context, event) => {
                    context.intention = dialog.get_intention(context.grammer, event) 
                  }),
                  always : [
                    {
                      target: '#persistComplaint',
                      cond: (context) => context.intention != dialog.INTENTION_UNKOWN,
                      actions: assign((context, event) => context.slots.pgr["locality"] = context.intention)
                    },
                    {
                      target: 'error',
                    }, 
                  ]
                },
                error: {
                  onEntry: assign( (context, event) => {
                    dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
                  }),
                  always:  'question',
                }
              }
            },
            landmark: {
              // come here when user 1) did not provide geolocation or 2) did not confirm geolocation - either because google maps got it wrong or if there was a google api error 

            }
          }
        },
        other: {
          // get other info

        },
        persistComplaint: {
          id: 'persistComplaint',
          invoke: {
            id: 'persistComplaint',
            src: (context) => pgrService.persistComplaint(context.user,context.slots.pgr,context.extraInfo),
            onDone: {
              target: '#endstate',
              actions: assign((context, event) => {
                let complaintDetails = event.data;
                let message = dialog.get_message(messages.fileComplaint.persistComplaint, context.user.locale);
                message = message.replace('{{complaintNumber}}', complaintDetails.complaintNumber);
                message = message.replace('{{complaintLink}}', complaintDetails.complaintLink);
                dialog.sendMessage(context, message, false);
              })
            }
          }
        },
      }, // fileComplaint.states
    },  // fileComplaint
    trackComplaint: {
      id: 'trackComplaint',
      invoke: {
        id: 'fetchOpenComplaints',
        src: (context) => pgrService.fetchOpenComplaints(context.user),
        onDone: [
          {
            target: '#endstate',
            cond: (context, event) => {
              return event.data.length>0;
            },
            actions: assign((context, event) => {     
              let complaints = event.data;
  
              let message = dialog.get_message(messages.trackComplaint.results.preamble, context.user.locale);
              message += '\n';
              for(let i = 0; i < complaints.length; i++) {
                let template = dialog.get_message(messages.trackComplaint.results.complaintTemplate, context.user.locale);
                let complaint = complaints[i];
                template = template.replace('{{complaintType}}',complaint.complaintType);
                template = template.replace('{{complaintNumber}}', complaint.complaintNumber);
                template = template.replace('{{filedDate}}', complaint.filedDate);
                template = template.replace('{{complaintStatus}}', complaint.complaintStatus);
                template = template.replace('{{complaintLink}}', complaint.complaintLink);
                message += '\n\n' + (i + 1) + '. ' + template;
              }
              dialog.sendMessage(context, message, false);
            })
          },
          {
            target: '#endstate',
            actions: assign((context, event) => {
              let message = dialog.get_message(messages.trackComplaint.noRecords, context.user.locale);
              dialog.sendMessage(context, message, false);
            })
          }
        ]
      }
    } // trackComplaint
  } // pgr.states
}; // pgr

let messages = {
  pgrmenu: {
    question: {
      en_IN : 'Please type\n\n1. File New Complaint.\n2. Track Your Complaints.',
      hi_IN: 'कृप्या टाइप करे\n\n1. यदि आप शिकायत दर्ज करना चाहते हैं\n2. यदि आप अपनी शिकायतों की स्थिति देखना चाहते हैं'
    }
  },
  fileComplaint: {
    complaintType: {
      question: {
        preamble: {
          en_IN : 'Please enter the number for your complaint',
          hi_IN : 'कृपया अपनी शिकायत के लिए नंबर दर्ज करें'
        },
        other: {
          en_IN : 'Other ...',
          hi_IN : 'कुछ अन्य ...'
        }
      }
    }, // complaintType
    complaintType2Step: {
      category: {
        question: {
          preamble: {
            en_IN : 'Please enter the number for your complaint category',
            hi_IN : 'अपनी शिकायत श्रेणी के लिए नंबर दर्ज करें'
          },
          otherType: {
            en_IN: 'Others',
            hi_IN: 'अन्य'
          }
        }
      },
      item: {
        question: {
          preamble : {
            en_IN : 'Please enter the number for your complaint item',
            hi_IN : 'अपनी शिकायत के लिए नंबर दर्ज करें'
          },
        }
      },
    }, // complaintType2Step
    geoLocation: {
      question: {
        en_IN :'If you are at the grievance site, please share your location. Otherwise type any character.',
        hi_IN : 'यदि आप शिकायत स्थल पर हैं, तो कृपया अपना स्थान साझा करें। अगर नहीं किसी भी चरित्र को टाइप करें।'
      }
    }, // geoLocation 
    confirmLocation: {
      confirmCityAndLocality: {
        en_IN: 'Is this the correct location of the complaint?\nCity: {{city}}\nLocality: {{locality}}\nPlease send "No", if it is incorrect',
        hi_IN: 'क्या यह शिकायत का सही स्थान है?\nशहर: {{city}} \n स्थान: {{locality}} \n अगर यह गलत है तो कृपया "No" भेजें ।'
      },
      confirmCity: {
        en_IN: 'Is this the correct location of the complaint?\nCity: {{city}}\nPlease send "*No*", if it is incorrect',
        hi_IN: 'क्या यह शिकायत का सही स्थान है? \nशहर: {{city}}\n अगर यह गलत है तो कृपया "*No*" भेजें ।'
      }
    },
    city: {
      question: {
        preamble: {
          en_IN: 'Please select your city from the link given below. Tap on the link to search and select your city.',
          hi_IN: 'कृपया नीचे दिए गए लिंक से अपने शहर का चयन करें। अपने शहर को खोजने और चुनने के लिए लिंक पर टैप करें।'
        }
      }
    }, // city
    locality: {
      question: {
        preamble: {
          en_IN: 'Please select the locality of your complaint from the link below. Tap on the link to search and select a locality.',
          hi_IN: 'कृपया नीचे दिए गए लिंक से अपनी शिकायत के इलाके का चयन करें। किसी इलाके को खोजने और चुनने के लिए लिंक पर टैप करें।'
        }
      }
    }, // locality
    persistComplaint: {
      en_IN: 'Thank You! You have successfully filed a complaint through mSeva Punjab.\nYour Complaint No is : {{complaintNumber}}\nYou can view and track your complaint  through the link below:\n{{complaintLink}}\n',
      hi_IN: 'धन्यवाद! आपने mSeva Punjab के माध्यम से सफलतापूर्वक शिकायत दर्ज की है।\nआपकी शिकायत संख्या: {{complaintNumber}}\n आप नीचे दिए गए लिंक के माध्यम से अपनी शिकायत देख और ट्रैक कर सकते हैं:\n {{complaintLink}}\n'
    }
  }, // fileComplaint
  trackComplaint: {
    noRecords: {
      en_IN: 'There are no open complaints.\nPlease type and send mseva to go to the main menu options.',
      hi_IN: 'अब आपके द्वारा पंजीकृत कोई खुली शिकायत नहीं है।\nमुख्य मेनू पर वापस जाने के लिए ‘mseva’ टाइप करें और भेजें ।'
    },
    results: {
      preamble: {
        en_IN: 'Your Open Complaints',
        hi_IN: 'आपकी पंजीकृत ओपन शिकायतें'
      },
      complaintTemplate: {
        en_IN: '*{{complaintType}}*\nComplaint No: {{complaintNumber}}\nFiled Date: {{filedDate}}\nCurrent Complaint Status: *{{complaintStatus}}*\nTap on the link below to view the complaint\n{{complaintLink}}',
        hi_IN: '*{{complaintType}}*\nशिकायत संख्या: {{complaintNumber}}\nदायर तिथि: {{filedDate}}\nशिकायत की स्थिति: *{{complaintStatus}}*\nशिकायत देखने के लिए नीचे दिए गए लिंक पर टैप करें\n{{complaintLink}}'
      }
    }
  }
}; // messages

let grammer = {
  pgrmenu: {
    question: [
      {intention: 'file_new_complaint', recognize: ['1', 'file', 'new']},
      {intention: 'track_existing_complaints', recognize: ['2', 'track', 'existing']}
    ]
  },
};
module.exports = pgr;
