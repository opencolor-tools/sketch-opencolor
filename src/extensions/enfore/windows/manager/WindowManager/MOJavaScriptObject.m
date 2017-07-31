#import "MOJavaScriptObject.h"

@implementation MOJavaScriptObject

- (JSValue*) callWithArguments:(NSArray*)argumentsArray {
    JSContext *context = [JSContext contextWithJSGlobalContextRef:(JSGlobalContextRef)self.JSContext];
    JSValue *function = [JSValue valueWithJSValueRef:self.JSObject inContext:context];
    
    return [function callWithArguments:argumentsArray];
}

@end
