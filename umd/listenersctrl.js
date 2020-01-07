(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        var nsp = factory();
        for ( var name in nsp ) 
        { root[name] = nsp[name]; }
    }
}(this, function() {
'use strict';
var nsp = { ListenersCtrl: (function() {
    var Select = function( 
        Strict, GetIndices, List,
        EvName, EvListener, UseCapture,
        Connected, Marker ) 
    {
        var EvNameUDF = (EvName === undefined || (!Strict && EvName === null));
        var EvListenerUDF = (EvListener === undefined || (!Strict && EvListener === null));
        var UseCaptureUDF = (UseCapture === undefined || (!Strict && UseCapture === null));
        var ConnectedUDF = (Connected === undefined || (!Strict && Connected === null));
        var MarkerUDF = (Marker === undefined || (!Strict && Marker === null));
        var Result = [];
        for ( var i=0; i < List.length; i++ ) {
            if ( 
                (EvNameUDF || List[i][0] === EvName) &&
                (EvListenerUDF || List[i][1] === EvListener) &&
                (UseCaptureUDF || List[i][2] === UseCapture) &&
                (ConnectedUDF || List[i][3] === Connected) &&
                (MarkerUDF || List[i][4] === Marker)
            ) {
                if ( GetIndices ) Result.push( i );
                else Result.push( List[i] );
            }
        }
        return Result;
    };
    var SetConnectionState = (function() {
        var Methods = [ 'addEventListener', 'removeEventListener' ];
        return function( Connect, Index, Instance, NotModify ) {
            if ( Instance.List[Index][3] === Connect ) return;
            if ( Connect === null ) Connect = Instance.List[Index][3];
            Instance.Elem[Methods[ Connect ? 0 : 1 ]](
                Instance.List[Index][0], 
                Instance.List[Index][1], 
                Instance.List[Index][2] 
            );
            if ( !NotModify ) Instance.List[Index][3] = Connect;
        };
    })();
    var Methods = {
        PrependCore$: function(EvName, EvListener, UseCapture, Marker, Instance) {
            UseCapture = !!UseCapture;
            Marker = ( Marker !== undefined ) ? Marker : null;
            var IndexFound = Select(
                true, true, Instance.List, 
                EvName, EvListener, UseCapture
            )[0];
            if ( IndexFound !== undefined ) { 
                if ( Marker === null ) Marker = Instance.List[ IndexFound ][4];
                Instance.List.splice(IndexFound, 1); 
            }
            Instance.List.unshift([
                EvName, EvListener, UseCapture,
                true, Marker
            ]);
        },
        Append$: function(EvName, EvListener, UseCapture, Marker, Instance) {
            UseCapture = !!UseCapture;
            Marker = ( Marker !== undefined ) ? Marker : null;
            var IndexFound = Select(
                true, true, Instance.List, 
                EvName, EvListener, UseCapture
            )[0];
            if ( IndexFound !== undefined ) {
                if ( Marker === null ) Marker = Instance.List[ IndexFound ][4];
                SetConnectionState( false, IndexFound, Instance );
                Instance.List.splice( IndexFound, 1 ); 
            }
            var Index = Instance.List.push([
                EvName, EvListener, UseCapture,
                false, Marker
            ]) - 1;
            SetConnectionState( true, Index, Instance );
            return Index;
        },
        Associate$: function( EvName, EvListener, UseCapture, Instance ) {
            UseCapture = !!UseCapture;
            var IndexFound = Select(
                true, true, Instance.List,
                EvName, EvListener, UseCapture
            )[0];
            if ( IndexFound ) return IndexFound;
            var Index = Instance.List.push([
                EvName, EvListener, UseCapture,
                false, null
            ]) - 1;
            return Index;
        },
        Invoke$: function( Argument, ConnectedOnly, Instance ) {
            var Method = ( Argument && Argument.constructor === Array )
                ? 'apply' : 'call';
            for ( var i=0; i < Instance.LastIndices.length; i++ ) {
                var Index = Instance.LastIndices[i];
                if ( ConnectedOnly && !Instance.List[Index][3] ) continue; 
                Instance.List[Index][1][ Method ]( Instance.Elem, Argument );
            }
        },
        Connect$: function( Connect, Instance ) {
            for ( var i=0; i < Instance.LastIndices.length; i++ ) {
                var Index = Instance.LastIndices[i];
                SetConnectionState( Connect, Index, Instance );
            }
        },
        Select$: function( Marker, OtherFilters, Instance ) {
            var EvName = OtherFilters && OtherFilters.type;
            var UseCapture = OtherFilters && OtherFilters.useCapture;
            var Connected = OtherFilters && OtherFilters.connected;
            var Listener = OtherFilters && OtherFilters.listener;
            Instance.LastIndices = Select(
                false, true, Instance.List,
                EvName, Listener, UseCapture,
                Connected, Marker
            );
        },
        Prepend: function( EvName, EvListener, UseCapture ) {
            var Instance = this.Instance;
            for ( var i=0; i < Instance.List.length; i++ ) 
            { SetConnectionState( false, i, Instance, true ); }
            Methods.PrependCore$(
                EvName, EvListener, UseCapture,
                undefined, Instance
            );
            for ( var i=0; i < Instance.List.length; i++ ) 
            { SetConnectionState( null, i, Instance ); }
            Instance.LastIndices = [ 0 ];
            return Instance.MethodLists.Extended;
        },
        PrependArray: function( ListenersArray ) {
            var Instance = this.Instance;
            for ( var i=0; i < Instance.List.length; i++ ) 
            { SetConnectionState( false, i, Instance, true ); }
            Instance.LastIndices = [];
            for ( var i=ListenersArray.length-1; i >= 0; i-- ) {
                Methods.PrependCore$(
                    ListenersArray[i][0], 
                    ListenersArray[i][1], 
                    ListenersArray[i][2],
                    ListenersArray[i][4], 
                    Instance
                );
                Instance.LastIndices.push( ListenersArray.length - 1 - i );
            }
            for ( var i=0; i < Instance.List.length; i++ ) 
            { SetConnectionState( null, i, Instance ); }
            return Instance.MethodLists.Extended;
        },
        Append: function( EvName, EvListener, UseCapture ) {
            var Instance = this.Instance;
            Instance.LastIndices = [ Methods.Append$(
                EvName, EvListener, UseCapture,
                undefined, Instance
            ) ];
            return Instance.MethodLists.Extended;
        },
        AppendArray: function( ListenersArray ) {
            var Instance = this.Instance;
            Instance.LastIndices = [];
            for ( var i=0; i < ListenersArray.length; i++ ) {
                Instance.LastIndices.push(Methods.Append$(
                    ListenersArray[i][0],
                    ListenersArray[i][1],
                    ListenersArray[i][2],
                    ListenersArray[i][4],
                    Instance
                ));
            }
            return Instance.MethodLists.Extended;
        },
        Apply: function( EvName, EvListener, UseCapture ) {
            UseCapture = !!UseCapture;
            var Instance = this.Instance;
            for ( var i=0; i < Instance.List.length; i++ ) 
            { SetConnectionState( false, i, Instance ); }
            Instance.Elem.addEventListener(
                EvName, 
                EvListener, 
                UseCapture 
            );
            Instance.List = [[
                EvName, EvListener, UseCapture,
                true, null,
            ]];
            Instance.LastIndices = [ 0 ];
            return Instance.MethodLists.Extended;
        },
        ApplyArray: function( ListenersArray ) {
            var Instance = this.Instance;
            for ( var i=0; i < Instance.List.length; i++ ) 
            { SetConnectionState( false, i, Instance, true ); }
            Instance.List = [];
            Instance.LastIndices = [];
            for ( var i=0; i < ListenersArray.length; i++ ) {
                var UseCapture = !!( ListenersArray[i][2] );
                var Connected = !( ListenersArray[i][3] === false );
                var Marker = ( ListenersArray[i][4] !== undefined ) 
                    ? ListenersArray[i][4] : null;
                if ( Connected ) {
                    Instance.Elem.addEventListener(
                        ListenersArray[i][0],
                        ListenersArray[i][1],
                        UseCapture
                    );
                }
                Instance.LastIndices.push(Instance.List.push([
                    ListenersArray[i][0], ListenersArray[i][1],
                    UseCapture, Connected, Marker
                ]) - 1);
            }
            return Instance.MethodLists.Extended;
        },
        Associate: function( EvName, EvListener, UseCapture ) {
            var Instance = this.Instance;
            Instance.LastIndices = [ Methods.Associate$( 
                EvName, EvListener, 
                UseCapture, Instance 
            ) ];
            return Instance.MethodLists.Extended;
        },
        AssociateArray: function( ListenersArray ) {
            var Instance = this.Instance;
            Instance.LastIndices = [];
            for ( var i=0; i < ListenersArray.length; i++ ) {
                Instance.LastIndices.push(Methods.Associate$(
                    ListenersArray[i][0],
                    ListenersArray[i][1],
                    ListenersArray[i][2],
                    Instance
                ));
            }
            return Instance.MethodLists.Extended;
        },
        Invoke: function( Argument, Marker, OtherFilters ) {
            var Instance = this.Instance;
            Methods.Select$( Marker, OtherFilters, Instance );
            Methods.Invoke$( Argument, false, Instance );
            return Instance.MethodLists.Extended;
        },
        InvokeConn: function( Argument, Marker, OtherFilters ) {
            var Instance = this.Instance;
            Methods.Select$( Marker, OtherFilters, Instance );
            Methods.Invoke$( Argument, true, Instance );
            return Instance.MethodLists.Extended;
        },
        Disconn: function( Marker, OtherFilters ) {
            var Instance = this.Instance;
            Methods.Select$( Marker, OtherFilters, Instance );
            Methods.Connect$( false, Instance );
            return Instance.MethodLists.Extended;
        },
        Connect: function( Marker, OtherFilters ) {
            var Instance = this.Instance;
            Methods.Select$( Marker, OtherFilters, Instance );
            Methods.Connect$( true, Instance );
            return Instance.MethodLists.Extended;
        },
        IsAssociated: function( EvName, EvListener, UseCapture ) {
            UseCapture = !!UseCapture;
            var Instance = this.Instance;
            var IndexFound = Select(
                true, true, Instance.List, 
                EvName, EvListener, UseCapture
            )[0];
            return ( IndexFound !== undefined );
        },
        IsConnected: function( EvName, EvListener, UseCapture ) {
            UseCapture = !!UseCapture;
            var Instance = this.Instance;
            var IndexFound = Select(
                true, true, Instance.List, 
                EvName, EvListener, UseCapture, true
            )[0];
            return ( IndexFound !== undefined );
        },
        Count: function() {
            return this.Instance.List.length;
        },
        CountConn: function() {
            return Select(
                true, true, this.Instance.List, 
                undefined, undefined, undefined, true
            ).length;
        },
        Select: function( Marker, OtherFilters ) {
            var Instance = this.Instance;
            Methods.Select$( Marker, OtherFilters, Instance );
            return Instance.MethodLists.Selector;
        },
        Remove: function( EvName, EvListener, UseCapture ) {
            UseCapture = !!UseCapture;
            var Instance = this.Instance;
            var IndexFound = Select(
                true, true, Instance.List, 
                EvName, EvListener, UseCapture
            )[0];
            if ( IndexFound === undefined ) return Instance.MethodLists.Main;
            SetConnectionState( false, IndexFound, Instance );
            Instance.List.splice( IndexFound, 1 );
            return Instance.MethodLists.Main;
        },
        Clear: function() {
            var Instance = this.Instance;
            for ( var i=0; i < Instance.List.length; i++ ) 
            { SetConnectionState( false, i, Instance ); }
            Instance.List = [];
            return Instance.MethodLists.Main;
        },
        As: function( Marker ) {
            var Instance = this.Instance;
            for ( var i=0; i < Instance.LastIndices.length; i++ ) {
                var Index = Instance.LastIndices[i];
                Instance.List[Index][4] = Marker; 
            }
            return Instance.MethodLists.Main;
        },
        PrependSelected: function() {
            var Instance = this.Instance;
            for ( var i=0; i < Instance.List.length; i++ ) 
            { SetConnectionState( false, i, Instance, true ); }
            var LastIndices = [];
            Instance.LastIndices.sort().reverse();
            for ( var i=0; i < Instance.LastIndices.length; i++ ) {
                var Index = Instance.LastIndices[i] + i;
                Methods.PrependCore$(
                    Instance.List[Index][0], 
                    Instance.List[Index][1], 
                    Instance.List[Index][2],
                    Instance.List[Index][4], 
                    Instance
                );
                LastIndices.push( i );
            }
            for ( var i=0; i < Instance.List.length; i++ ) 
            { SetConnectionState( null, i, Instance ); }
            Instance.LastIndices = LastIndices;
            return Instance.MethodLists.Extended;
        },
        AppendSelected: function() {
            var Instance = this.Instance;
            var LastIndices = [];
            Instance.LastIndices.sort();
            for ( var i=0; i < Instance.LastIndices.length; i++ ) {
                var Index = Instance.LastIndices[i] - i;
                LastIndices.push(Methods.Append$(
                    Instance.List[Index][0],
                    Instance.List[Index][1],
                    Instance.List[Index][2],
                    Instance.List[Index][4],
                    Instance
                ));
            }
            Instance.LastIndices = LastIndices;
            return Instance.MethodLists.Extended;
        },
        ApplySelected: function() {
            var Instance = this.Instance;
            for ( var i=0; i < Instance.List.length; i++ ) 
            { SetConnectionState( false, i, Instance ); }
            var List = [];
            var LastIndices = [];
            for ( var i=0; i < Instance.LastIndices.length; i++ ) {
                var Index = Instance.LastIndices[i];
                SetConnectionState( true, Index, Instance );
                LastIndices.push( List.push( Instance.List[Index] ) - 1 );
            }
            Instance.List = List;
            Instance.LastIndices = LastIndices;
            return Instance.MethodLists.Extended;
        },
        InvokeSelected: function( Argument ) {
            var Instance = this.Instance;
            Methods.Invoke$( Argument, false, Instance );
            return Instance.MethodLists.Extended;
        },
        InvokeConnSelected: function( Argument ) {
            var Instance = this.Instance;
            Methods.Invoke$( Argument, true, Instance );
            return Instance.MethodLists.Extended;
        },
        DisconnSelected: function() {
            var Instance = this.Instance;
            Methods.Connect$( false, Instance );
            return Instance.MethodLists.Extended;
        },
        ConnectSelected: function() {
            var Instance = this.Instance;
            Methods.Connect$( true, Instance );
            return Instance.MethodLists.Extended;
        },
        CountSelected: function() {
            return this.Instance.LastIndices.length;
        },
        CountConnSelected: function() {
            var Instance = this.Instance, Result = 0;
            for ( var i=0; i < Instance.LastIndices.length; i++ ) {
                var Index = Instance.LastIndices[i];
                if ( Instance.List[Index][3] ) Result++;
            }
            return Result;
        },
        RemoveSelected: function() {
            var Instance = this.Instance;
            Instance.LastIndices.sort();
            var ListenersRemoved = 0;
            for ( var i=0; i < Instance.LastIndices.length; i++ ) {
                var Index = Instance.LastIndices[i] - ListenersRemoved++;
                SetConnectionState( false, Index, Instance );
                Instance.List.splice( Index, 1 ); 
            }
            return Instance.MethodLists.Main;
        },
        GetElement: function() {
            var Instance = this.Instance;
            return Instance.Elem;
        },
    };
    var MainMethods = {
        Prepend: Methods.Prepend,
        PrependArray: Methods.PrependArray,
        Append: Methods.Append,
        AppendArray: Methods.AppendArray,
        Apply: Methods.Apply,
        ApplyArray: Methods.ApplyArray,
        Associate: Methods.Associate,
        AssociateArray: Methods.AssociateArray,
        Invoke: Methods.Invoke,
        InvokeConn: Methods.InvokeConn,
        Disconn: Methods.Disconn,
        Connect: Methods.Connect,
        IsAssociated: Methods.IsAssociated,
        IsConnected: Methods.IsConnected,
        Count: Methods.Count,
        CountConn: Methods.CountConn,
        Select: Methods.Select,
        Remove: Methods.Remove,
        Clear: Methods.Clear,
        GetElement: Methods.GetElement,
    };
    var SelectorMethods = {
        Prepend: Methods.PrependSelected,
        Append: Methods.AppendSelected,
        Apply: Methods.ApplySelected,
        Invoke: Methods.InvokeSelected,
        InvokeConn: Methods.InvokeConnSelected,
        Disconn: Methods.DisconnSelected,
        Connect: Methods.ConnectSelected,
        Count: Methods.CountSelected,
        CountConn: Methods.CountConnSelected,
        Remove: Methods.RemoveSelected,
    };
    var NamingMethods = {
        As: Methods.As
    };
    return function( Elem ) {
        if ( typeof Elem === 'string' ) Elem = document.querySelector(Elem);
        var Instance = {
            Elem: Elem,
            List: [],
            LastIndices: [],
            MethodLists: {
                Main: {},
                Extended: {},
                Selector: {}
            },
        };
        for ( var Method in MainMethods ) { 
            Instance.MethodLists.Main[Method] = MainMethods[Method];
            Instance.MethodLists.Extended[Method] = MainMethods[Method];
        }
        for ( var Method in SelectorMethods ) 
        { Instance.MethodLists.Selector[Method] = SelectorMethods[Method]; }
        for ( var Method in NamingMethods ) { 
            Instance.MethodLists.Extended[Method] = NamingMethods[Method];
            Instance.MethodLists.Selector[Method] = NamingMethods[Method];
        }
        Instance.Instance = Instance;
        Instance.MethodLists.Main.Instance = Instance;
        Instance.MethodLists.Extended.Instance = Instance;
        Instance.MethodLists.Selector.Instance = Instance;
        return Instance.MethodLists.Main;
    };
})(), ListenersAggt: (function() {
    var Instances = [];
    var GetInstance = function( ElementOrMarker ) {
        for ( var i=0; i < Instances.length; i++ ) {
            if ( 
                Instances[i].Element === ElementOrMarker ||
                Instances[i].Marker === ElementOrMarker
            )
            { return i; }
        }
        return -1;
    };
    var CreateInstance = function( Element, Marker ) {
        var Instance = nsp.ListenersCtrl( Element );
        return Instances.push({
            Element: Element,
            Marker: ( Marker !== undefined ) ? Marker : null,
            Instance: Instance.Instance,
        }) - 1;
    };
    var RemoveInstance = function( ElementOrMarker ) {
        for ( var i=0; i < Instances.length; i++ ) {
            if ( 
                Instances[i].Element === ElementOrMarker ||
                Instances[i].Marker === ElementOrMarker
            ) { 
                var Instance = Instances[i].Instance;
                Instances.splice(i--, 1);
                return Instance;
            }
        }
    };
    return {
        Element: function( Element, Marker ) {
            if ( typeof Element === 'string' ) 
            { Element = document.querySelector(Element); }
            var InstanceIndex = GetInstance( Element );
            if ( InstanceIndex < 0 ) 
            { InstanceIndex = CreateInstance(Element, Marker); }
            else if ( Marker !== undefined )
            { Instances[ InstanceIndex ].Marker = Marker; }
            return Instances[ InstanceIndex ].Instance.MethodLists.Main;
        },
        Alias: function( Marker ) {
            var InstanceIndex = GetInstance( Marker );
            if ( InstanceIndex < 0 ) return null;
            return Instances[ InstanceIndex ].Instance.MethodLists.Main;
        },
        Release: function( Element ) {
            if ( Element === undefined ) {
                var Result = Instances;
                Instances = [];
                return Result;
            }
            if ( typeof Element === 'string' ) Element = document.querySelector(Element);
            var Instance = RemoveInstance( Element );
            return Instance && Instance.MethodLists.Main;
        },
        ReleaseByAlias: function( Marker ) {
            var Instance = RemoveInstance( Marker );
            return Instance && Instance.MethodLists.Main;
        },
        Clear: function( Element ) {
            if ( Element === undefined ) {
                for ( var i=0; i < Instances.length; i++ ) 
                { Instances[i].Instance.Clear(); }
                Instances = [];
                return this;
            }
            if ( typeof Element === 'string' ) Element = document.querySelector(Element);
            var Instance = RemoveInstance( Element );
            return Instance && Instance.MethodLists.Main.Clear();
        },
        ClearByAlias: function( Marker ) {
            var Instance = RemoveInstance( Marker );
            return Instance && Instance.MethodLists.Main.Clear();
        },
    };
})() };
return nsp;
}));
