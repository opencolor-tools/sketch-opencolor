#import <Foundation/Foundation.h>
#import <JavaScriptCore/JavaScriptCore.h>

@interface MOJavaScriptObject : NSObject

@property (readonly) JSObjectRef JSObject;
@property (readonly) JSContextRef JSContext;

- (JSValue*) callWithArguments:(NSArray*)argumentsArray;

@end
