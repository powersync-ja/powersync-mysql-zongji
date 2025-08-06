# @powersync/mysql-zongji

## 0.5.0

### Minor Changes

- 1abb7b7: Added binlog hearbeat parsing and type definitions
  Updated the CodeEvent enum to include the newer MySQL BinLog types

  Exposed startAtEnd option in the Zongji start options. Thank you @svenpaulsen!

## 0.4.0

### Minor Changes

- ee0fc27: Emit error when an unrecoverable schema change was encountered

## 0.3.0

### Minor Changes

- 65ca2b2: - Added type definitions for binlog query event
  - Added the ability to provide a table filter function for including/excluding binlog events
  - Updated Zongji class type definition

## 0.2.0

### Minor Changes

- 941b166: Added the functionality to pause / resume the zongji binlog listener
  Improved stop/start functionality to better handle some race conditions
  Added type definitions
  The first time a TableMap event is emitted, it will always be emitted, but subsequent events will only be emitted if the table map has changed.

## 0.1.0

### Minor Changes

- ff85814: Initial release of the powersync-mysql-zongji fork
  - Added custom gtid binlog event
