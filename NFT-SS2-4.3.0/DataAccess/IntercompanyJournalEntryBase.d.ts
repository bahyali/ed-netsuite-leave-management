/**
 * NS Base intercompany journal entry record (intercompanyjournalentry) - contains definitions for fields and sublists
 */
import * as record from 'N/record';
import { JournalEntryBase, LineSublist as JeLineSublist } from "./JournalEntryBase";
import { Sublist } from "./Sublist";
/**
 * Intercompany Journal Entry Line (line) sublist
 */
export declare class LineSublist extends JeLineSublist {
    /**
     * the line-level subsidiary - this is a difference between normal journal entry and intercompany JE
     */
    linesubsidiary: number;
}
/**
 * defines an Inter-company journal entry (basically identical to a normal journal entry?)
 */
export declare class IntercompanyJournalEntryBase extends JournalEntryBase {
    static recordType: record.Type;
    line: Sublist<LineSublist>;
}
