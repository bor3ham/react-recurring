import React, { Component } from 'react'
import RRule from 'rrule';
import FrequencySelect from './frequency-select'
import DailyInput from './daily-input'
import WeeklyInput from './weekly-input'
import MonthlyInput from './monthly-input'
import YearlyInput from './yearly-input'
import styles from './recurrence-input.css'

class RecurrenceInput extends Component {

    constructor( props ) {
        super( props );
        this.state = {
            period: 1,
            dom: 1
        };
        this.updateRule = this.updateRule.bind( this );
        this.handleChange = this.handleChange.bind( this );
        this.handleFrequencyChange = this.handleFrequencyChange.bind( this );
        this.getValue = this.getValue.bind( this );
        this.setValue = this.setValue.bind( this );
    }

    componentDidMount() {
        const { value } = this.props || {};
        this.setValue( value );
    }

    updateRule( state = {} ) {
        const { frequency, weekday, period, lastDom, dom, doy, mode, ordinal } = { ...(this.state || {}), ...state };

        let byweekday = weekday;
        if( byweekday !== undefined && frequency == RRule.MONTHLY && mode == 'W' && ordinal !== undefined )
            byweekday = byweekday.nth( ordinal );

        let opts = {
            freq: frequency,
            interval: period
        };
        if( byweekday !== undefined && (ordinal !== undefined || frequency == RRule.WEEKLY) )
            opts.byweekday = byweekday;
        if( dom !== undefined && mode == 'M' ) {
            if( lastDom )
                opts.bymonthday = -dom;
            else
                opts.bymonthday = dom;
        }
        if( doy !== undefined && frequency == RRule.YEARLY )
            opts.byyearday = doy;

        this.rule = new RRule( opts );

        return this.rule;
    }

    getValue() {
        return this.rule.toString();
    }

    setValue( value ) {
        if( value ) {
            this.rule = RRule.fromString( value );
            let opts = this.rule.options;
            let mode, weekday, ordinal, dom, lastDom;
            const weekdayMap = [
                RRule.MO,
                RRule.TU,
                RRule.WE,
                RRule.TH,
                RRule.FR,
                RRule.SA,
                RRule.SU,
            ];
            if( opts.byweekday !== null && opts.byweekday !== undefined && opts.byweekday.length > 0 ) {
                weekday = weekdayMap[opts.byweekday[0]];
            }
            else if( opts.bynweekday !== null && opts.bynweekday !== undefined && opts.bynweekday.length > 0 ) {
                mode = 'W';
                [ weekday, ordinal ] = opts.bynweekday[0];
                weekday = weekdayMap[weekday];
            }
            else if( opts.bynmonthday !== null && opts.bynmonthday !== undefined && opts.bynmonthday.length > 0 ) {
                mode = 'M';
                dom = opts.bynmonthday[0];
                if( dom < 0 ) {
                    dom *= -1;
                    lastDom = true;
                }
                else
                    lastDom = false;
            }
            else if( opts.bymonthday !== null && opts.bymonthday !== undefined && opts.bymonthday.length > 0 ) {
                mode = 'M';
                dom = opts.bymonthday[0];
                if( dom < 0 ) {
                    dom *= -1;
                    lastDom = true;
                }
                else
                    lastDom = false;
            }
            this.setState({
                frequency: opts.freq,
                weekday: weekday,
                period: opts.interval,
                dom: dom,
                lastDom: lastDom,
                ordinal: ordinal,
                doy: opts.byyearday,
                mode: mode
            });
        }
    }

    sendChange() {
        const { onChange } = this.props;
        if( onChange )
            onChange( this.getValue() );
    }

    handleChange( event, value ) {
        value.rule = this.updateRule( value );
        this.setState( value );
        this.sendChange();
    }

    handleFrequencyChange( event, value ) {
        event.preventDefault();
        this.handleChange( event, {
            frequency: value,
            weekday: undefined,
            period: 1,
            mode: undefined,
            ordinal: undefined,
            dom: 1,
            doy: 1
        } );
    }

    render() {
        const { name } = this.props;
        const { frequency, weekday, period, ordinal, mode,
                lastDom, dom, doy, rule } = this.state || {};

        let periodCom;
        switch( frequency ) {
            case RRule.DAILY:
                periodCom = <DailyInput onChange={ this.handleChange } period={ period } />;
                break;
            case RRule.WEEKLY:
                periodCom = <WeeklyInput onChange={ this.handleChange } weekday={ weekday } period={ period } />;
                break;
            case RRule.MONTHLY:
                periodCom = <MonthlyInput onChange={ this.handleChange } mode={ mode } weekday={ weekday }
                                          lastDom={ lastDom } dom={ dom } ordinal={ ordinal } period={ period } />;
                break;
            case RRule.YEARLY:
                periodCom = <YearlyInput onChange={ this.handleChange } doy={ doy } period={ period } />;
                break;
        };

        let ruleCom;
        if( rule )
            ruleCom = <div className={ styles.rule }><span>{ rule.toText() }</span></div>;

        return (
            <div className={ styles.recurrenceInput }>
              <FrequencySelect onChange={ this.handleFrequencyChange } selected={ frequency } />
              { periodCom }
              { ruleCom }
              <input type="hidden" name={ name } />
            </div>
        );
    }
}

export default RecurrenceInput;
